use crate::features::auth::models::{User, RegisterUser, LoginUser, AuthResponse};
use crate::config::Config;
use sqlx::Row;
use sqlx::SqlitePool;
// use bcrypt::{hash, verify}; // Removed bcrypt
use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};
use chrono::Utc;
use crate::features::auth::jwt::{create_jwt, create_refresh_token, UserRoleClaim};
use crate::features::abac::AbacService;
use crate::features::users::service::UserService;
use thiserror::Error;
use axum::response::IntoResponse;
use axum::http::StatusCode;
use serde::{Serialize, Deserialize};
use std::io::Write;
use tokio::sync::broadcast;

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct NotificationEvent {
    pub user_id: String,
    pub message: String,
    pub id: i64,
    pub created_at: String,
}

#[derive(Error, Debug)]
pub enum AuthError {
    #[error("User already exists")]
    UserExists,

    #[error("Invalid credentials")]
    InvalidCredentials,

    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),

    #[error("JWT error: {0}")]
    JwtError(String),

    #[error("Password hash error: {0}")]
    PasswordHashError(String),

    #[error("Validation error: {0}")]
    ValidationError(String),
    
    #[error("Refresh token not found or invalid")]
    InvalidRefreshToken,

    #[error("User not found")]
    UserNotFound,
}

#[derive(Clone)]
pub struct AuthService {
    pool: SqlitePool,
    config: Config,
    abac_service: AbacService,
    user_service: UserService,
    notification_tx: broadcast::Sender<NotificationEvent>,
}

impl AuthService {
    pub fn new(pool: SqlitePool, config: Config, abac_service: AbacService, user_service: UserService) -> Self {
        let (notification_tx, _) = broadcast::channel(100);
        Self { pool, config, abac_service, user_service, notification_tx }
    }

    pub fn get_user_service(&self) -> &UserService {
        &self.user_service
    }

    pub fn get_abac_service(&self) -> &AbacService {
        &self.abac_service
    }

    /// Fetch user roles from ABAC and convert to claims format
    async fn get_user_role_claims(&self, user_id: &str) -> Vec<UserRoleClaim> {
        self.abac_service
            .get_user_roles(user_id)
            .await
            .map(|assignments| {
                assignments
                    .into_iter()
                    .map(|a| UserRoleClaim {
                        role_name: a.role_name,
                        resource_id: a.resource_id,
                    })
                    .collect()
            })
            .unwrap_or_default() // On error, return empty roles
    }

    pub async fn register(&self, user: RegisterUser) -> Result<AuthResponse, AuthError> {
        // Check if user already exists
        let existing_user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
            .bind(&user.email)
            .fetch_optional(&self.pool)
            .await?;

        if existing_user.is_some() {
            return Err(AuthError::UserExists);
        }

        // Hash password with Argon2
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let password_hash = argon2.hash_password(user.password.as_bytes(), &salt)
            .map_err(|e| AuthError::PasswordHashError(e.to_string()))?
            .to_string();

        let id = uuid::Uuid::new_v4().to_string();

        // Insert user
        let created_user = sqlx::query_as::<_, User>(
            "INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *"
        )
        .bind(&id)
        .bind(&user.username)
        .bind(&user.email)
        .bind(&password_hash)
        .bind(Utc::now().to_rfc3339())
        .bind(Utc::now().to_rfc3339())
        .fetch_one(&self.pool)
        .await?;

        // Generate tokens
        self.generate_tokens(created_user.id, created_user.username, created_user.email, false).await
    }

    pub async fn login(&self, login_user: LoginUser, ip: Option<String>, user_agent: Option<String>) -> Result<AuthResponse, AuthError> {
        // Find user by email or username
        let found_user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1 OR username = $1")
            .bind(&login_user.identifier)
            .fetch_optional(&self.pool)
            .await?;

        let user = found_user.ok_or(AuthError::InvalidCredentials)?;

        // Verify password with Argon2
        let parsed_hash = PasswordHash::new(&user.password_hash).map_err(|_| AuthError::InvalidCredentials)?;
        if Argon2::default().verify_password(login_user.password.as_bytes(), &parsed_hash).is_err() {
             return Err(AuthError::InvalidCredentials);
        }

        // Device / new IP detection: compare stored last_login_ip and user_agent
        let mut is_new_device = false;
        if let Some(stored_ip) = &user.last_login_ip {
            if let Some(current_ip) = &ip {
                if stored_ip != current_ip {
                    is_new_device = true;
                }
            }
        } else if ip.is_some() {
            is_new_device = true;
        }

        if let Some(stored_ua) = &user.last_user_agent {
            if let Some(current_ua) = &user_agent {
                if stored_ua != current_ua {
                    is_new_device = true;
                }
            }
        } else if user_agent.is_some() {
            is_new_device = true;
        }

        // If new device/IP detected, create an in-app notification and (optionally) email
        if is_new_device {
            let msg = format!("New sign-in detected from IP {} and device/agent {}", ip.clone().unwrap_or_default(), user_agent.clone().unwrap_or_default());
            let _ = self.create_notification(&user.id, &msg).await;
            // also write email log for awareness (non-blocking)
            let _ = (|| -> Result<(), Box<dyn std::error::Error>> {
                let logdir = "backend/data";
                std::fs::create_dir_all(logdir)?;
                let path = format!("{}/emails.log", logdir);
                let mut f = std::fs::OpenOptions::new().create(true).append(true).open(&path)?;
                let now = Utc::now().to_rfc3339();
                writeln!(f, "[{}] Login notification sent to: {}", now, &user.email)?;
                Ok(())
            })();
        }

        // Update last login metadata
        sqlx::query("UPDATE users SET last_login_ip = $1, last_user_agent = $2, last_login_at = $3, updated_at = $4 WHERE id = $5")
            .bind(ip.clone())
            .bind(user_agent.clone())
            .bind(Utc::now().to_rfc3339())
            .bind(Utc::now().to_rfc3339())
            .bind(&user.id)
            .execute(&self.pool)
            .await?;

        // Generate tokens
        self.generate_tokens(user.id, user.username, user.email, login_user.remember_me.unwrap_or(false)).await
    }

    /// Change a user's password given their email, current password and new password.
    pub async fn change_password(&self, email: &str, current_password: &str, new_password: &str) -> Result<(), AuthError> {
        // Fetch user
        let found_user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
            .bind(email)
            .fetch_optional(&self.pool)
            .await?;

        let user = found_user.ok_or(AuthError::InvalidCredentials)?;

        // Verify current password (Argon2)
        let parsed_hash = PasswordHash::new(&user.password_hash).map_err(|_| AuthError::InvalidCredentials)?;
        if Argon2::default().verify_password(current_password.as_bytes(), &parsed_hash).is_err() {
             return Err(AuthError::InvalidCredentials);
        }

        // Hash new password (Argon2)
        let salt = SaltString::generate(&mut OsRng);
        let new_hash = Argon2::default().hash_password(new_password.as_bytes(), &salt)
            .map_err(|e| AuthError::PasswordHashError(e.to_string()))?
            .to_string();

        // Update password in DB
        sqlx::query(
            "UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3"
        )
        .bind(&new_hash)
        .bind(Utc::now().to_rfc3339())
        .bind(&user.id)
        .execute(&self.pool)
        .await?;

        self.create_notification(&user.id, "Your password was successfully changed.").await?;

        Ok(())
    }

    async fn generate_tokens(&self, user_id: String, username: String, email: String, remember_me: bool) -> Result<AuthResponse, AuthError> {
        // Fetch user roles from ABAC
        let roles = self.get_user_role_claims(&user_id).await;
        
        let access_token = match create_jwt(&user_id, &username, &email, roles.clone(), &self.config) {
            Ok(t) => t,
            Err(e) => {
                tracing::error!(error = ?e, "create_jwt failed");
                return Err(AuthError::JwtError(e.to_string()));
            }
        };
        let (refresh_token, refresh_jti) = match create_refresh_token(&user_id, &username, &email, roles, &self.config) {
            Ok((t, j)) => (t, j),
            Err(e) => {
                tracing::error!(error = ?e, "create_refresh_token failed");
                return Err(AuthError::JwtError(e.to_string()));
            }
        };

        // Store the refresh token jti in the DB so we can validate/blacklist it later.
        let refresh_token_id = refresh_jti.clone();
        sqlx::query(
            "INSERT INTO refresh_tokens (token_id, user_id, expires_at) VALUES ($1, $2, $3)"
        )
        .bind(&refresh_token_id)
        .bind(&user_id)
        .bind(Utc::now().timestamp() + self.config.refresh_token_expiry)
        .execute(&self.pool)
        .await?;

        Ok(AuthResponse {
            access_token,
            refresh_token,
            expires_in: self.config.jwt_expiry,
            remember_me,
        })
    }

    pub async fn refresh_token(&self, refresh_token: String) -> Result<AuthResponse, AuthError> {
        // Validate the refresh token
        let claims = crate::features::auth::jwt::validate_jwt(&refresh_token, &self.config)
            .map_err(|e| AuthError::JwtError(e.to_string()))?;

        // Determine if this was a remembered session by checking if we have an existing refresh token jti
        // Note: For simplicity, we'll assume if they have a valid refresh token, we should maintain the "remembered" state if it was already there.
        // In a more complex system, you might store this in the token or DB.
        // For now, let's keep it simple: refresh always returns remember_me=true if called with a valid cookie.

        // Check if refresh token jti exists in database (not blacklisted)
        let token_exists = sqlx::query_scalar::<_, bool>(
            "SELECT EXISTS(SELECT 1 FROM refresh_tokens WHERE token_id = $1 AND user_id = $2 AND expires_at > $3)"
        )
        .bind(&claims.jti)
        .bind(&claims.sub)
        .bind(Utc::now().timestamp())
        .fetch_one(&self.pool)
        .await?;

        if !token_exists {
            return Err(AuthError::InvalidRefreshToken);
        }

        // Blacklist the old refresh token jti
        sqlx::query(
            "UPDATE refresh_tokens SET expires_at = $1 WHERE token_id = $2"
        )
        .bind(Utc::now().timestamp())
        .bind(&claims.jti)
        .execute(&self.pool)
        .await?;

        // Generate new tokens
        self.generate_tokens(claims.sub.clone(), claims.username, claims.email, true).await
    }

    pub async fn delete_users_by_prefix(&self, prefix: &str) -> Result<(), AuthError> {
        let pattern = format!("{}%", prefix);
        sqlx::query("DELETE FROM users WHERE email LIKE $1")
            .bind(pattern)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
    
    // Notifications
    pub async fn create_notification(&self, user_id: &str, message: &str) -> Result<(), AuthError> {
        let created_at = Utc::now().to_rfc3339();
        let id: i64 = sqlx::query_scalar("INSERT INTO notifications (user_id, message, read, created_at) VALUES ($1, $2, 0, $3) RETURNING id")
            .bind(user_id)
            .bind(message)
            .bind(&created_at)
            .fetch_one(&self.pool)
            .await?;

        let _ = self.notification_tx.send(NotificationEvent {
            user_id: user_id.to_string(),
            message: message.to_string(),
            id,
            created_at,
        });

        Ok(())
    }

    pub async fn get_notifications(&self, user_id: &str) -> Result<Vec<(i64, String, i64, String)>, AuthError> {
        let rows = sqlx::query("SELECT id, message, read, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC")
            .bind(user_id)
            .fetch_all(&self.pool)
            .await?;
        let mut out = Vec::new();
        for r in rows {
            let id: i64 = r.try_get("id")?;
            let message: String = r.try_get("message")?;
            let read: i64 = r.try_get("read")?;
            let created_at: String = r.try_get("created_at")?;
            out.push((id, message, read, created_at));
        }
        Ok(out)
    }

    pub async fn mark_notification_read(&self, notification_id: i64, user_id: &str) -> Result<(), AuthError> {
        sqlx::query("UPDATE notifications SET read = 1 WHERE id = $1 AND user_id = $2")
            .bind(notification_id)
            .bind(user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn mark_all_notifications_read(&self, user_id: &str) -> Result<(), AuthError> {
        sqlx::query("UPDATE notifications SET read = 1 WHERE user_id = $1")
            .bind(user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub fn subscribe_notifications(&self) -> broadcast::Receiver<NotificationEvent> {
        self.notification_tx.subscribe()
    }
    
    // Method to logout and blacklist refresh token
    pub async fn logout(&self, refresh_token: String) -> Result<(), AuthError> {
        sqlx::query(
            "UPDATE refresh_tokens SET expires_at = $1 WHERE token_id = $2"
        )
        .bind(Utc::now().timestamp())
        .bind(&refresh_token)
        .execute(&self.pool)
        .await?;
        Ok(())
    }
}

impl AuthService {
    /// Return total number of users.
    pub async fn count_users(&self) -> Result<i64, AuthError> {
        let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
            .fetch_one(&self.pool)
            .await?;
        Ok(count.0)
    }

    /// Return number of active (non-expired) refresh tokens.
    pub async fn count_active_refresh_tokens(&self) -> Result<i64, AuthError> {
        let now = Utc::now().timestamp();
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM refresh_tokens WHERE expires_at > $1",
        )
        .bind(now)
        .fetch_one(&self.pool)
        .await?;
        Ok(count.0)
    }
    
    /// Return recent users ordered by creation date descending.
    pub async fn recent_users(&self, limit: i64) -> Result<Vec<User>, AuthError> {
        let users = sqlx::query_as::<_, User>(
            "SELECT * FROM users ORDER BY created_at DESC LIMIT $1"
        )
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;
        Ok(users)
    }
}

impl IntoResponse for AuthError {
    fn into_response(self) -> axum::response::Response {
        let status = match self {
            AuthError::UserExists => StatusCode::CONFLICT,
            AuthError::InvalidCredentials => StatusCode::UNAUTHORIZED,
            AuthError::DatabaseError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AuthError::JwtError(_) => StatusCode::UNAUTHORIZED,
            AuthError::PasswordHashError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AuthError::ValidationError(_) => StatusCode::BAD_REQUEST,
            AuthError::InvalidRefreshToken => StatusCode::UNAUTHORIZED,
            AuthError::UserNotFound => StatusCode::NOT_FOUND,
        };

        (status, self.to_string()).into_response()
    }
}

