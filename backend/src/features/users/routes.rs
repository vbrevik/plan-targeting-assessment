use axum::{
    extract::{Path, State, Json},
    routing::get,
    Router,
};
use crate::features::users::service::UserService;
use crate::features::auth::models::User;
use crate::features::auth::service::AuthError;

pub fn users_routes() -> Router<UserService> {
    Router::new()
        .route("/", get(list_users))
        .route("/:id", get(get_user))
}

async fn list_users(
    State(service): State<UserService>,
) -> Result<Json<Vec<User>>, AuthError> {
    let users = service.find_all().await?;
    Ok(Json(users))
}

async fn get_user(
    State(service): State<UserService>,
    Path(id): Path<String>,
) -> Result<Json<User>, AuthError> {
    let user = service.find_by_id(&id).await?;
    Ok(Json(user))
}
