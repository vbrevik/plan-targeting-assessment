use sqlx::{Pool, Sqlite};
use super::models::{Resource, Role, UserRole, Permission, UserRoleAssignment, AssignRoleInput, CreateResourceInput};

#[derive(Debug)]
pub enum AbacError {
    DatabaseError(String),
    NotFound(String),
    InvalidInput(String),
}

impl std::fmt::Display for AbacError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AbacError::DatabaseError(msg) => write!(f, "Database error: {}", msg),
            AbacError::NotFound(msg) => write!(f, "Not found: {}", msg),
            AbacError::InvalidInput(msg) => write!(f, "Invalid input: {}", msg),
        }
    }
}

impl From<sqlx::Error> for AbacError {
    fn from(err: sqlx::Error) -> Self {
        AbacError::DatabaseError(err.to_string())
    }
}

#[derive(Clone)]
pub struct AbacService {
    pool: Pool<Sqlite>,
}

impl AbacService {
    pub fn new(pool: Pool<Sqlite>) -> Self {
        Self { pool }
    }

    // ==================== ROLES ====================

    pub async fn list_roles(&self) -> Result<Vec<Role>, AbacError> {
        let roles = sqlx::query_as::<_, Role>("SELECT id, name, description, created_at::text FROM roles ORDER BY name")
            .fetch_all(&self.pool)
            .await?;
        Ok(roles)
    }

    pub async fn get_role_by_name(&self, name: &str) -> Result<Role, AbacError> {
        sqlx::query_as::<_, Role>("SELECT id, name, description, created_at::text FROM roles WHERE name = $1")
            .bind(name)
            .fetch_optional(&self.pool)
            .await?
            .ok_or_else(|| AbacError::NotFound(format!("Role '{}' not found", name)))
    }

    // ==================== RESOURCES ====================

    pub async fn list_resources(&self) -> Result<Vec<Resource>, AbacError> {
        let resources = sqlx::query_as::<_, Resource>("SELECT id, name, resource_type, created_at::text FROM resources ORDER BY name")
            .fetch_all(&self.pool)
            .await?;
        Ok(resources)
    }

    // ==================== USER ROLES ====================

    pub async fn get_user_roles(&self, user_id: &str) -> Result<Vec<UserRoleAssignment>, AbacError> {
        let assignments = sqlx::query_as::<_, UserRoleAssignment>(
            r#"
            SELECT 
                ur.id,
                ur.user_id,
                r.name as role_name,
                ur.resource_id,
                res.name as resource_name
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            LEFT JOIN resources res ON ur.resource_id = res.id
            WHERE ur.user_id = $1
            ORDER BY r.name, res.name
            "#
        )
            .bind(user_id)
            .fetch_all(&self.pool)
            .await?;
        Ok(assignments)
    }

    // ==================== PERMISSIONS ====================

    pub async fn get_role_permissions(&self, role_id: &str) -> Result<Vec<Permission>, AbacError> {
        let permissions = sqlx::query_as::<_, Permission>(
            "SELECT id, role_id, action, created_at::text FROM permissions WHERE role_id = $1"
        )
            .bind(role_id)
            .fetch_all(&self.pool)
            .await?;
        Ok(permissions)
    }

    /// Check if a user has a specific permission for a resource
    /// Returns true if:
    /// 1. User has a global role (resource_id IS NULL) with the permission or wildcard (*)
    /// 2. User has a scoped role for the specific resource with the permission or wildcard
    pub async fn check_permission(&self, user_id: &str, action: &str, resource_id: Option<&str>) -> Result<bool, AbacError> {
        let has_permission = sqlx::query_scalar::<_, bool>(
            r#"
            SELECT EXISTS (
                SELECT 1 
                FROM user_roles ur
                JOIN permissions p ON ur.role_id = p.role_id
                WHERE ur.user_id = $1
                  AND (p.action = $2 OR p.action = '*')
                  AND (ur.resource_id IS NULL OR ur.resource_id = $3)
            )
            "#
        )
            .bind(user_id)
            .bind(action)
            .bind(resource_id)
            .fetch_one(&self.pool)
            .await?;
        
        Ok(has_permission)
    }

    /// Get all permissions for a user across all their roles
    /// Returns a flat list of unique permission actions
    pub async fn get_user_permissions(&self, user_id: &str) -> Result<Vec<String>, AbacError> {
        let permissions = sqlx::query_scalar::<_, String>(
            r#"
            SELECT DISTINCT p.action
            FROM user_roles ur
            JOIN permissions p ON ur.role_id = p.role_id
            WHERE ur.user_id = $1
            ORDER BY p.action
            "#
        )
            .bind(user_id)
            .fetch_all(&self.pool)
            .await?;
        
        Ok(permissions)
    }
}
