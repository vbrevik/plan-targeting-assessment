use axum::{
    async_trait,
    extract::{FromRequestParts, State},
    http::{request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use core_abac::AbacService;
use core_auth::jwt::Claims;

/// Extractor that requires a specific permission for access
/// 
/// Usage:
/// ```ignore
/// async fn delete_project(
///     RequirePermission(user, _): RequirePermission,
///     Path(project_id): Path<String>,
/// ) -> impl IntoResponse { ... }
/// ```
pub struct RequirePermission {
    pub claims: Claims,
}

/// Error type for permission check failures
#[derive(Debug)]
pub enum PermissionError {
    Unauthorized,
    Forbidden(String),
    InternalError(String),
}

impl IntoResponse for PermissionError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            PermissionError::Unauthorized => (StatusCode::UNAUTHORIZED, "Authentication required"),
            PermissionError::Forbidden(msg) => (StatusCode::FORBIDDEN, {
                // We need to return a static str, so we'll use a generic message
                // The actual message is logged server-side
                tracing::warn!("Permission denied: {}", msg);
                "You do not have permission to perform this action"
            }),
            PermissionError::InternalError(msg) => {
                tracing::error!("ABAC internal error: {}", msg);
                (StatusCode::INTERNAL_SERVER_ERROR, "Authorization check failed")
            }
        };
        
        (status, Json(serde_json::json!({ "error": message }))).into_response()
    }
}

/// Check if user has a specific permission, optionally scoped to a resource
pub async fn check_user_permission(
    abac_service: &AbacService,
    user_id: &str,
    action: &str,
    resource_id: Option<&str>,
) -> Result<bool, PermissionError> {
    abac_service
        .check_permission(user_id, action, resource_id)
        .await
        .map_err(|e| PermissionError::InternalError(e.to_string()))
}

/// Middleware function to require a specific permission
/// 
/// Use with axum's `from_fn_with_state` for route-level permission checks
#[allow(dead_code)]
pub async fn require_permission<B>(
    State(abac_service): State<AbacService>,
    claims: Option<Claims>,
    action: &'static str,
    resource_id: Option<String>,
) -> Result<(), PermissionError> {
    let claims = claims.ok_or(PermissionError::Unauthorized)?;
    
    let has_permission = check_user_permission(
        &abac_service,
        &claims.sub,
        action,
        resource_id.as_deref(),
    )
    .await?;
    
    if has_permission {
        Ok(())
    } else {
        Err(PermissionError::Forbidden(format!(
            "User {} lacks permission '{}' for resource {:?}",
            claims.sub, action, resource_id
        )))
    }
}
