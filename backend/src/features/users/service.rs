use sqlx::SqlitePool;
use crate::features::auth::models::User;
use crate::features::auth::service::AuthError;
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
        let users = sqlx::query_as::<_, User>("SELECT * FROM users")
            .fetch_all(&self.pool)
            .await?;
        Ok(users)
    }

    pub async fn find_by_id(&self, id: &str) -> Result<User, AuthError> {
        let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?
            .ok_or(AuthError::UserNotFound)?;
        Ok(user)
    }
}
