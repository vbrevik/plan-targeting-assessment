use axum::{Router, routing::post, routing::get};
use crate::features::auth::AuthService;
use crate::features::auth::handlers::{
    session::{login_handler, logout_handler, refresh_token_handler},
    user::{register_handler, user_handler, change_password_handler, profile_update_handler},
    notification::{notifications_handler, mark_all_notifications_read_handler, notifications_stream_handler, mark_notification_read_handler},
    admin::{cleanup_handler, debug_handler},
};

pub fn public_auth_routes() -> Router<AuthService> {
    Router::new()
        .route("/register", post(register_handler))
        .route("/login", post(login_handler))
        .route("/refresh", post(refresh_token_handler))
}

pub fn protected_auth_routes() -> Router<AuthService> {
    tracing::info!("Initializing protected_auth_routes");
    Router::new()
        .route("/change-password", post(change_password_handler))
        .route("/notifications", get(notifications_handler))
        .route("/notifications/read-all", post(mark_all_notifications_read_handler))
        .route("/notifications/stream", get(notifications_stream_handler))
        .route("/notifications/:id/read", post(mark_notification_read_handler))
        .route("/logout", post(logout_handler))
        .route("/user", get(user_handler))
        // Explicitly using axum::routing::put to match original if needed, or just put
        .route("/profile", axum::routing::put(profile_update_handler))
        .route("/debug", get(debug_handler))
        .route("/test/cleanup", post(cleanup_handler))
}
