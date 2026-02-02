use sqlx::{Pool, Sqlite};
use super::models::{Resource, Role, UserRole, Permission, UserRoleAssignment, AssignRoleInput, CreateResourceInput};
use sqlx::types::chrono::Utc;

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
        let roles = sqlx::query_as::<_, Role>("SELECT id, name, description, created_at FROM v_roles_ontology ORDER BY name")
            .fetch_all(&self.pool)
            .await?;
        Ok(roles)
    }

    pub async fn get_role_by_name(&self, name: &str) -> Result<Role, AbacError> {
        sqlx::query_as::<_, Role>("SELECT id, name, description, created_at FROM v_roles_ontology WHERE name = $1")
            .bind(name)
            .fetch_optional(&self.pool)
            .await?
            .ok_or_else(|| AbacError::NotFound(format!("Role '{}' not found", name)))
    }

    pub async fn create_role(&self, name: &str, description: Option<&str>) -> Result<Role, AbacError> {
        let id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        
        sqlx::query(r#"
            INSERT INTO entities (id, name, type, description, status, classification, created_at, updated_at, properties) 
            VALUES ($1, $2, 'ROLE', $3, 'ACTIVE', 'UNCLASSIFIED', $4, $4, '{}')
        "#)
            .bind(&id)
            .bind(name)
            .bind(description)
            .bind(&now)
            .execute(&self.pool)
            .await?;
            
        Ok(Role {
            id,
            name: name.to_string(),
            description: description.map(|s| s.to_string()),
            created_at: now,
        })
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
            FROM v_user_roles_ontology ur
            JOIN v_roles_ontology r ON ur.role_id = r.id
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

        // Create relationship directly
        let id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        
        // Properties JSON
        let props = if let Some(rid) = &input.resource_id {
            serde_json::json!({ "resource_id": rid })
        } else {
            serde_json::json!({}) // Empty props or NULL? View expects resource_id in props.
        };
        // Note: View expects CASE WHEN resource_id IS NOT NULL...
        // Migration insert uses NULL if empty. But here we can use empty object or null.
        // Let's use properties with resource_id if present.
        
        sqlx::query(r#"
            INSERT INTO entity_relationships (id, source_id, target_id, relation_type, properties, created_at)
            VALUES ($1, $2, $3, 'HAS_ROLE', $4, $5)
        "#)
            .bind(&id)
            .bind(&input.user_id)
            .bind(&role.id)
            .bind(props.to_string())
            .bind(&now)
            .execute(&self.pool)
            .await?;

        // Return struct manually constructed or fetch
        // Fetch to confirm view visibility
         let user_role = sqlx::query_as::<_, UserRole>(
            "SELECT id, user_id, role_id, resource_id, created_at FROM v_user_roles_ontology WHERE id = $1"
        )
            .bind(&id)
            .fetch_one(&self.pool)
            .await?;
        Ok(user_role)
    }

    pub async fn remove_role(&self, user_role_id: &str) -> Result<(), AbacError> {
        let result = sqlx::query("DELETE FROM entity_relationships WHERE id = $1 AND relation_type = 'HAS_ROLE'")
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
            r#"
            SELECT p.id, er.source_id as role_id, p.action, p.created_at
            FROM v_permissions_ontology p
            JOIN entity_relationships er ON p.id = er.target_id
            WHERE er.source_id = $1 AND er.relation_type = 'HAS_PERMISSION'
            "#
        )
            .bind(role_id)
            .fetch_all(&self.pool)
            .await?;
        Ok(permissions)
    }

    pub async fn add_permission(&self, role_id: &str, action: &str) -> Result<Permission, AbacError> {
        // 1. Create Permission Entity
        let perm_id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        
        let props = serde_json::json!({
            "action": action,
            "resource_type": "System"
        });

        sqlx::query(r#"
            INSERT INTO entities (id, name, type, description, status, classification, created_at, updated_at, properties) 
            VALUES ($1, $2, 'PERMISSION', 'Permission Action', 'ACTIVE', 'UNCLASSIFIED', $3, $3, $4)
        "#)
            .bind(&perm_id)
            .bind(action) // name
            .bind(&now)
            .bind(props.to_string())
            .execute(&self.pool)
            .await?;

        // 2. Link Role -> Permission
        sqlx::query(r#"
            INSERT INTO entity_relationships (source_id, target_id, relation_type, created_at)
            VALUES ($1, $2, 'HAS_PERMISSION', $3)
        "#)
            .bind(role_id)
            .bind(&perm_id)
            .bind(&now)
            .execute(&self.pool)
            .await?;

        Ok(Permission {
            id: perm_id,
            role_id: role_id.to_string(),
            action: action.to_string(),
            created_at: now,
        })
    }

    pub async fn remove_permission(&self, permission_id: &str) -> Result<(), AbacError> {
        // Delete permission entity. Cascading should happen? No. Manual delete of relationship?
        // Let's delete entity. Relationships with cascading constraints should go if constraints exist.
        // Migration 20260123083000... entity_relationships FOREIGN KEY ... ON DELETE CASCADE.
        // So deleting entity is enough.
        let result = sqlx::query("DELETE FROM entities WHERE id = $1 AND type = 'PERMISSION'")
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
                FROM v_user_roles_ontology ur
                JOIN entity_relationships er ON ur.role_id = er.source_id AND er.relation_type = 'HAS_PERMISSION'
                JOIN v_permissions_ontology p ON er.target_id = p.id
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
            FROM v_user_roles_ontology ur
            JOIN entity_relationships er ON ur.role_id = er.source_id AND er.relation_type = 'HAS_PERMISSION'
            JOIN v_permissions_ontology p ON er.target_id = p.id
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
