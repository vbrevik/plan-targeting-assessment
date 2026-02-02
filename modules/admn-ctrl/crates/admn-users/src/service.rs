use sqlx::SqlitePool;
use core_common_types::User;
use core_users::AuthError;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};

#[derive(Clone)]
pub struct UserService {
    pool: SqlitePool,
}

impl UserService {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn find_all(&self) -> Result<Vec<User>, AuthError> {
        let users = sqlx::query_as::<_, User>("SELECT * FROM v_users_ontology")
            .fetch_all(&self.pool)
            .await?;
        Ok(users)
    }

    pub async fn find_by_id(&self, id: &str) -> Result<User, AuthError> {
        let user = sqlx::query_as::<_, User>("SELECT * FROM v_users_ontology WHERE id = ?")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?
            .ok_or(AuthError::UserNotFound)?;
        Ok(user)
    }

    pub async fn create(&self, username: &str, email: &str, password: &str) -> Result<User, AuthError> {
        let id = uuid::Uuid::new_v4().to_string();
        let salt = SaltString::generate(&mut OsRng);
        let password_hash = Argon2::default()
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| AuthError::PasswordHashError(e.to_string()))?
            .to_string();

        let now = chrono::Utc::now().to_rfc3339();
        let props = serde_json::json!({
            "email": email,
            "password_hash": password_hash
        });

        sqlx::query(r#"
            INSERT INTO entities (id, name, type, description, status, classification, created_at, updated_at, properties) 
            VALUES (?, ?, 'USER', 'System User', 'ACTIVE', 'UNCLASSIFIED', ?, ?, ?)
        "#)
            .bind(&id)
            .bind(username)
            .bind(&now)
            .bind(&now)
            .bind(props.to_string())
            .execute(&self.pool)
            .await?;

        self.find_by_id(&id).await
    }

    pub async fn update(&self, id: &str, username: Option<String>, email: Option<String>) -> Result<User, AuthError> {
        if username.is_none() && email.is_none() {
            return self.find_by_id(id).await;
        }

        let mut query_builder: sqlx::QueryBuilder<sqlx::Sqlite> = sqlx::QueryBuilder::new("UPDATE entities SET ");
        let mut separated = query_builder.separated(", ");

        // Update name (username) and properties (email)
        // Note: For properties, we need careful JSON patching or simple replacement if we have full state.
        // Here we do partial. Sqlite json_patch is good. 
        // But json_patch takes the whole object.
        
        if let Some(ref u) = username {
            separated.push("name = ");
            separated.push_bind_unseparated(u);
        }

        // Handle email update via properties
        if let Some(ref e) = email {
             // We need to update just the email field in properties.
             // SQLite: json_set(properties, '$.email', value)
             separated.push("properties = json_set(properties, '$.email', ");
             separated.push_bind_unseparated(e);
             separated.push_unseparated(")");
        }

        separated.push("updated_at = ");
        separated.push_bind_unseparated(chrono::Utc::now().to_rfc3339());

        query_builder.push(" WHERE id = ");
        query_builder.push_bind(id);

        query_builder
            .build()
            .execute(&self.pool)
            .await?;

        self.find_by_id(id).await
    }

    pub async fn delete(&self, id: &str) -> Result<(), AuthError> {
        sqlx::query("DELETE FROM entities WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
