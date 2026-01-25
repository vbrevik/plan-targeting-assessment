use axum::{Json, extract::State, Extension};
use tower_cookies::Cookies;
use validator::Validate;
use serde::{Deserialize, Serialize};

use crate::features::auth::{RegisterUser, AuthService, AuthResponse, User};
use crate::features::auth::service::AuthError;
use crate::features::auth::cookies::set_auth_cookies;

#[derive(Debug, Serialize, Deserialize)]
pub struct ChangePasswordRequest {
    pub email: String,
    pub current_password: String,
    pub new_password: String,
}

#[derive(Deserialize)]
pub struct UpdateProfileRequest {
    pub username: Option<String>,
}

#[axum::debug_handler]
pub async fn register_handler(
    State(auth_service): State<AuthService>,
    cookies: Cookies,
    Json(user): Json<RegisterUser>,
) -> Result<Json<AuthResponse>, AuthError> {
    if let Err(e) = user.validate() {
        tracing::warn!(email = %user.email, "Registration validation failed: {}", e);
        return Err(AuthError::ValidationError(e.to_string()));
    }

    match auth_service.register(user.clone()).await {
        Ok(response) => {
            tracing::info!(email = %user.email, "User registered successfully");
            set_auth_cookies(&cookies, &response);
            Ok(Json(response))
        }
        Err(e) => {
            tracing::warn!(email = %user.email, error = %e, "Registration failed");
            Err(e)
        }
    }
}

#[axum::debug_handler]
pub async fn user_handler(
    State(auth_service): State<AuthService>,
    Extension(claims): Extension<crate::features::auth::jwt::Claims>,
) -> Result<Json<crate::middleware::auth::User>, AuthError> {
    // Get all permissions for the user's roles
    let permissions = auth_service.get_abac_service()
        .get_user_permissions(&claims.sub)
        .await
        .unwrap_or_default();
    
    Ok(Json(crate::middleware::auth::User {
        id: claims.sub,
        username: claims.username,
        email: claims.email,
        roles: claims.roles,
        permissions,
    }))
}

#[axum::debug_handler]
pub async fn change_password_handler(
    State(auth_service): State<AuthService>,
    Json(req): Json<ChangePasswordRequest>,
) -> Result<Json<serde_json::Value>, AuthError> {
    // Basic validation
    if req.new_password.len() < 8 {
        return Err(AuthError::ValidationError("new password must be at least 8 characters".to_string()));
    }

    auth_service
        .change_password(&req.email, &req.current_password, &req.new_password)
        .await
        .map(|_| {
            Json(serde_json::json!({
                "message": "Password changed successfully. Notification sent."
            }))
        })
}

#[axum::debug_handler]
pub async fn profile_update_handler(
    State(auth_service): State<AuthService>,
    Extension(claims): Extension<crate::features::auth::jwt::Claims>,
    Json(req): Json<UpdateProfileRequest>,
) -> Result<Json<User>, AuthError> {
    let user = auth_service.get_user_service()
        .update(&claims.sub, req.username, None).await?;
    
    auth_service.create_notification(&claims.sub, "Your profile was updated.").await?;
    
    Ok(Json(user))
}
