use sqlx::SqlitePool;
use crate::features::auth::models::User;
use crate::features::auth::service::AuthError;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};

#[derive(Clone)]
pub struct UserService {
    pool: SqlitePool,
}

impl UserService {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn find_all(&self) -> Result<Vec<User>, AuthError> {
        let users = sqlx::query_as::<_, User>("SELECT * FROM users")
            .fetch_all(&self.pool)
            .await?;
        Ok(users)
    }

    pub async fn find_by_id(&self, id: &str) -> Result<User, AuthError> {
        let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?
            .ok_or(AuthError::UserNotFound)?;
        Ok(user)
    }

    pub async fn create(&self, username: &str, email: &str, password: &str) -> Result<User, AuthError> {
        let id = uuid::Uuid::new_v4().to_string();
        let salt = SaltString::generate(&mut OsRng);
        let password_hash = Argon2::default()
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| AuthError::PasswordHashError(e.to_string()))?
            .to_string();

        sqlx::query("INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)")
            .bind(&id)
            .bind(username)
            .bind(email)
            .bind(password_hash)
            .execute(&self.pool)
            .await?;

        self.find_by_id(&id).await
    }

    pub async fn update(&self, id: &str, username: Option<String>, email: Option<String>) -> Result<User, AuthError> {
        if username.is_none() && email.is_none() {
            return self.find_by_id(id).await;
        }

        let mut query_builder: sqlx::QueryBuilder<sqlx::Sqlite> = sqlx::QueryBuilder::new("UPDATE users SET ");
        let mut separated = query_builder.separated(", ");

        if let Some(ref u) = username {
            separated.push("username = ");
            separated.push_bind_unseparated(u);
        }
        if let Some(ref e) = email {
            separated.push("email = ");
            separated.push_bind_unseparated(e);
        }

        query_builder.push(" WHERE id = ");
        query_builder.push_bind(id);

        query_builder
            .build()
            .execute(&self.pool)
            .await?;

        self.find_by_id(id).await
    }

    pub async fn delete(&self, id: &str) -> Result<(), AuthError> {
        sqlx::query("DELETE FROM users WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
