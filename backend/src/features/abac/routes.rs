use axum::{
    routing::get,
    Router, Json, extract::{State, Path},
    http::StatusCode,
};
use crate::features::abac::service::AbacService;
use crate::features::abac::models::{Role, Resource, Permission, UserRoleAssignment};

pub fn abac_routes() -> Router<AbacService> {
    Router::new()
        .route("/roles", get(list_roles))
        .route("/resources", get(list_resources))
        .route("/users/:user_id/roles", get(get_user_roles))
        .route("/permissions/:role_id", get(get_role_permissions))
}

async fn list_roles(
    State(abac): State<AbacService>,
) -> Result<Json<Vec<Role>>, StatusCode> {
    abac.list_roles().await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn list_resources(
    State(abac): State<AbacService>,
) -> Result<Json<Vec<Resource>>, StatusCode> {
    abac.list_resources().await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn get_user_roles(
    State(abac): State<AbacService>,
    Path(user_id): Path<String>,
) -> Result<Json<Vec<UserRoleAssignment>>, StatusCode> {
    abac.get_user_roles(&user_id).await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn get_role_permissions(
    State(abac): State<AbacService>,
    Path(role_id): Path<String>,
) -> Result<Json<Vec<Permission>>, StatusCode> {
    abac.get_role_permissions(&role_id).await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}
