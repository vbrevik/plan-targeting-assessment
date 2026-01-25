use axum::{Json, extract::State};
use tower_cookies::Cookies;
use validator::Validate;

use crate::features::auth::{LoginUser, AuthService, AuthResponse};
use crate::features::auth::service::AuthError;
use crate::features::auth::cookies::{set_auth_cookies, clear_auth_cookies, REFRESH_TOKEN_COOKIE};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct RefreshTokenRequest {
    pub refresh_token: String,
}

#[axum::debug_handler]
pub async fn login_handler(
    State(auth_service): State<AuthService>,
    headers: axum::http::HeaderMap,
    cookies: Cookies,
    Json(user): Json<LoginUser>,
) -> Result<Json<AuthResponse>, AuthError> {
    if let Err(e) = user.validate() {
        tracing::warn!(identifier = %user.identifier, "Login validation failed: {}", e);
        return Err(AuthError::ValidationError(e.to_string()));
    }
    // Extract client IP and user-agent (prefer X-Forwarded-For if present)
    let ip = headers.get("x-forwarded-for").and_then(|v| v.to_str().ok()).map(|s| s.split(',').next().unwrap_or("").trim().to_string())
        .or_else(|| headers.get("x-real-ip").and_then(|v| v.to_str().ok()).map(|s| s.to_string()))
        .unwrap_or_else(|| "unknown".to_string());
    
    let user_agent = headers.get("user-agent").and_then(|v| v.to_str().ok()).map(|s| s.to_string());

    match auth_service.login(user.clone(), Some(ip.clone()), user_agent).await {
        Ok(response) => {
            tracing::info!(identifier = %user.identifier, ip = %ip, "User logged in successfully");
            set_auth_cookies(&cookies, &response);
            Ok(Json(response))
        }

        Err(e) => {
            tracing::warn!(identifier = %user.identifier, ip = %ip, error = %e, "Login failed");
            Err(e)
        }
    }
}

#[axum::debug_handler]
pub async fn logout_handler(
    State(auth_service): State<AuthService>,
    cookies: Cookies,
    body: Option<Json<RefreshTokenRequest>>,
) -> Result<&'static str, AuthError> {
    // Try to get refresh token from cookie or body to blacklist it
    let refresh_token = cookies.get(REFRESH_TOKEN_COOKIE)
        .map(|c| c.value().to_string())
        .or(body.map(|b| b.refresh_token.clone()));

    if let Some(token) = refresh_token {
        let _ = auth_service.logout(token).await;
        tracing::info!("User logged out");
    }
    
    clear_auth_cookies(&cookies);
    Ok("OK")
}

#[axum::debug_handler]
pub async fn refresh_token_handler(
    State(auth_service): State<AuthService>,
    cookies: Cookies,
    // We try to get refresh token from cookie first, then body
    body: Option<Json<RefreshTokenRequest>>,
) -> Result<Json<AuthResponse>, AuthError> {
    let refresh_token = if let Some(cookie) = cookies.get(REFRESH_TOKEN_COOKIE) {
        cookie.value().to_string()
    } else if let Some(Json(req)) = body {
        req.refresh_token
    } else {
        return Err(AuthError::ValidationError("Missing refresh token".to_string()));
    };

    match auth_service.refresh_token(refresh_token).await {
        Ok(response) => {
            tracing::debug!("Token refreshed successfully");
            set_auth_cookies(&cookies, &response);
            Ok(Json(response))
        }
        Err(e) => {
            tracing::warn!(error = %e, "Token refresh failed");
            Err(e)
        }
    }
}
