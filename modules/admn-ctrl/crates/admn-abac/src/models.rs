use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Represents an area/scope within the application (e.g., a project, team, module)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Resource {
    pub id: String,
    pub name: String,
    pub resource_type: String,
    pub created_at: String,
}

/// A role that can be assigned to users
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Role {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
}

/// Links a user to a role, optionally scoped to a specific resource
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UserRole {
    pub id: String,
    pub user_id: String,
    pub role_id: String,
    pub resource_id: Option<String>,
    pub created_at: String,
}

/// A permission (action) granted by a role
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Permission {
    pub id: String,
    pub role_id: String,
    pub action: String,
    pub created_at: String,
}

/// Represents a user's role assignment with resolved names (for API responses)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UserRoleAssignment {
    pub id: String,
    pub user_id: String,
    pub role_name: String,
    pub resource_id: Option<String>,
    pub resource_name: Option<String>,
}

/// Input for assigning a role to a user
#[derive(Debug, Deserialize, Clone)]
pub struct AssignRoleInput {
    pub user_id: String,
    pub role_name: String,
    pub resource_id: Option<String>,
}

/// Input for creating a new resource
#[derive(Debug, Deserialize, Clone)]
pub struct CreateResourceInput {
    pub name: String,
    pub resource_type: String,
}
