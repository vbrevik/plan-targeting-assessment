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

    pub async fn create_role(&self, name: &str, description: Option<&str>) -> Result<Role, AbacError> {
        let role = sqlx::query_as::<_, Role>(
            "INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at::text"
        )
            .bind(name)
            .bind(description)
            .fetch_one(&self.pool)
            .await?;
        Ok(role)
    }

    // ==================== RESOURCES ====================

    pub async fn list_resources(&self) -> Result<Vec<Resource>, AbacError> {
        let resources = sqlx::query_as::<_, Resource>("SELECT id, name, resource_type, created_at::text FROM resources ORDER BY name")
            .fetch_all(&self.pool)
            .await?;
        Ok(resources)
    }

    pub async fn create_resource(&self, input: CreateResourceInput) -> Result<Resource, AbacError> {
        let resource = sqlx::query_as::<_, Resource>(
            "INSERT INTO resources (name, resource_type) VALUES ($1, $2) RETURNING id, name, resource_type, created_at::text"
        )
            .bind(&input.name)
            .bind(&input.resource_type)
            .fetch_one(&self.pool)
            .await?;
        Ok(resource)
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

    pub async fn assign_role(&self, input: AssignRoleInput) -> Result<UserRole, AbacError> {
        // First, get the role by name
        let role = self.get_role_by_name(&input.role_name).await?;

        let user_role = sqlx::query_as::<_, UserRole>(
            r#"
            INSERT INTO user_roles (user_id, role_id, resource_id)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, role_id, resource_id) DO UPDATE SET user_id = EXCLUDED.user_id
            RETURNING id, user_id, role_id, resource_id, created_at::text
            "#
        )
            .bind(&input.user_id)
            .bind(&role.id)
            .bind(&input.resource_id)
            .fetch_one(&self.pool)
            .await?;
        Ok(user_role)
    }

    pub async fn remove_role(&self, user_role_id: &str) -> Result<(), AbacError> {
        let result = sqlx::query("DELETE FROM user_roles WHERE id = $1")
            .bind(user_role_id)
            .execute(&self.pool)
            .await?;
        
        if result.rows_affected() == 0 {
            return Err(AbacError::NotFound("User role assignment not found".to_string()));
        }
        Ok(())
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

    pub async fn add_permission(&self, role_id: &str, action: &str) -> Result<Permission, AbacError> {
        let permission = sqlx::query_as::<_, Permission>(
            "INSERT INTO permissions (role_id, action) VALUES ($1, $2) RETURNING id, role_id, action, created_at::text"
        )
            .bind(role_id)
            .bind(action)
            .fetch_one(&self.pool)
            .await?;
        Ok(permission)
    }

    pub async fn remove_permission(&self, permission_id: &str) -> Result<(), AbacError> {
        let result = sqlx::query("DELETE FROM permissions WHERE id = $1")
            .bind(permission_id)
            .execute(&self.pool)
            .await?;

        if result.rows_affected() == 0 {
            return Err(AbacError::NotFound("Permission not found".to_string()));
        }
        Ok(())
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
