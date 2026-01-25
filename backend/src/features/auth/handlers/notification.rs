use axum::{Json, extract::State, Extension, response::sse::{Event, Sse}};
use futures::stream::{self, Stream};
use std::convert::Infallible;
use tokio_stream::StreamExt as _;

use crate::features::auth::AuthService;
use crate::features::auth::service::AuthError;

#[axum::debug_handler]
pub async fn notifications_handler(
    State(auth_service): State<AuthService>,
    axum::extract::Query(query): axum::extract::Query<std::collections::HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, AuthError> {
    let user_id = query.get("user_id").ok_or(AuthError::ValidationError("missing user_id".to_string()))?;
    let notifs = auth_service.get_notifications(user_id).await?;
    let json: Vec<_> = notifs.into_iter().map(|(id, message, read, created_at)| {
        serde_json::json!({ "id": id, "message": message, "read": read, "created_at": created_at })
    }).collect();
    Ok(Json(serde_json::json!({ "notifications": json })))
}

#[axum::debug_handler]
pub async fn mark_notification_read_handler(
    State(auth_service): State<AuthService>,
    axum::extract::Path(id): axum::extract::Path<i64>,
    axum::extract::Query(query): axum::extract::Query<std::collections::HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, AuthError> {
    let user_id = query.get("user_id").ok_or(AuthError::ValidationError("missing user_id".to_string()))?;
    auth_service.mark_notification_read(id, user_id).await?;
    Ok(Json(serde_json::json!({ "ok": true })))
}

#[axum::debug_handler]
pub async fn mark_all_notifications_read_handler(
    State(auth_service): State<AuthService>,
    Extension(claims): Extension<crate::features::auth::jwt::Claims>,
) -> Result<Json<serde_json::Value>, AuthError> {
    auth_service.mark_all_notifications_read(&claims.sub).await?;
    Ok(Json(serde_json::json!({ "success": true })))
}

pub async fn notifications_stream_handler(
    State(auth_service): State<AuthService>,
    Extension(claims): Extension<crate::features::auth::jwt::Claims>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let rx = auth_service.subscribe_notifications();
    let user_id = claims.sub.clone();

    let stream = stream::unfold((rx, user_id), move |(mut rx, user_id)| async move {
        loop {
            match rx.recv().await {
                Ok(event) => {
                    if event.user_id == user_id {
                        let event = Event::default()
                            .data(serde_json::to_string(&event).unwrap_or_default());
                        return Some((Ok(event), (rx, user_id)));
                    }
                }
                Err(tokio::sync::broadcast::error::RecvError::Lagged(_)) => continue,
                Err(tokio::sync::broadcast::error::RecvError::Closed) => return None,
            }
        }
    });

    Sse::new(stream).keep_alive(axum::response::sse::KeepAlive::default())
}
