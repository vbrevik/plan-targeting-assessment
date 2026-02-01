use axum::{
    routing::{get, delete},
    Router, Json, extract::{State, Path},
    http::StatusCode,
};
use super::service::AbacService;
use super::models::{Role, Resource, Permission, AssignRoleInput, CreateResourceInput, UserRoleAssignment};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct CreateRoleInput {
    pub name: String,
    pub description: Option<String>,
}

#[derive(Deserialize)]
pub struct AddPermissionInput {
    pub action: String,
}

pub fn abac_routes() -> Router<AbacService> {
    Router::new()
        .route("/roles", get(list_roles).post(create_role))
        .route("/resources", get(list_resources).post(create_resource))
        .route("/users/:user_id/roles", get(get_user_roles).post(assign_role))
        .route("/users/roles/:id", delete(remove_role)) // Remove assignment by ID
        .route("/permissions/:role_id", get(get_role_permissions).post(add_permission))
        .route("/permissions/delete/:id", delete(remove_permission))
}

async fn list_roles(
    State(abac): State<AbacService>,
) -> Result<Json<Vec<Role>>, StatusCode> {
    abac.list_roles().await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn create_role(
    State(abac): State<AbacService>,
    Json(input): Json<CreateRoleInput>,
) -> Result<Json<Role>, StatusCode> {
    abac.create_role(&input.name, input.description.as_deref()).await
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

async fn create_resource(
    State(abac): State<AbacService>,
    Json(input): Json<CreateResourceInput>,
) -> Result<Json<Resource>, StatusCode> {
    abac.create_resource(input).await
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

async fn assign_role(
    State(abac): State<AbacService>,
    Path(user_id): Path<String>,
    Json(mut input): Json<AssignRoleInput>,
) -> Result<Json<super::models::UserRole>, StatusCode> {
    // Ensure user_id in input matches path if needed, or just overwrite it
    input.user_id = user_id;
    
    abac.assign_role(input).await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn remove_role(
    State(abac): State<AbacService>,
    Path(id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    abac.remove_role(&id).await
        .map(|_| StatusCode::NO_CONTENT)
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

async fn add_permission(
    State(abac): State<AbacService>,
    Path(role_id): Path<String>,
    Json(input): Json<AddPermissionInput>,
) -> Result<Json<Permission>, StatusCode> {
    abac.add_permission(&role_id, &input.action).await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn remove_permission(
    State(abac): State<AbacService>,
    Path(id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    abac.remove_permission(&id).await
        .map(|_| StatusCode::NO_CONTENT)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}
