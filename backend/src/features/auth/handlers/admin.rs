use axum::{Json, extract::State, Extension};
use tower_cookies::Cookies;
use serde::{Deserialize, Serialize};

use crate::features::auth::AuthService;
use crate::features::auth::service::AuthError;
use crate::features::auth::cookies::ACCESS_TOKEN_COOKIE;

#[derive(Debug, Serialize, Deserialize)]
pub struct CleanupRequest {
    pub prefix: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DebugAuthResponse {
    pub raw_token: String,
    pub claims: crate::features::auth::jwt::Claims,
    pub db_roles: Vec<crate::features::abac::models::UserRoleAssignment>,
}

#[axum::debug_handler]
pub async fn cleanup_handler(
    State(auth_service): State<AuthService>,
    Json(req): Json<CleanupRequest>,
) -> Result<&'static str, AuthError> {
    // Only allow when test endpoints are enabled
    if std::env::var("ENABLE_TEST_ENDPOINTS").unwrap_or_default() != "true" {
        return Err(AuthError::ValidationError("test endpoints disabled".to_string()));
    }

    let prefix = req.prefix.unwrap_or_else(|| "e2e_user_".to_string());
    auth_service.delete_users_by_prefix(&prefix).await.map(|_| "OK")
}

#[axum::debug_handler]
pub async fn debug_handler(
    State(auth_service): State<AuthService>,
    cookies: Cookies,
    Extension(claims): Extension<crate::features::auth::jwt::Claims>,
) -> Result<Json<DebugAuthResponse>, AuthError> {
    let raw_token = cookies.get(ACCESS_TOKEN_COOKIE)
        .map(|c| c.value().to_string())
        .unwrap_or_else(|| "Not found in cookies".to_string());

    let db_roles = auth_service.get_abac_service().get_user_roles(&claims.sub).await
        .map_err(|e| AuthError::ValidationError(e.to_string()))?;

    Ok(Json(DebugAuthResponse {
        raw_token,
        claims,
        db_roles,
    }))
}
