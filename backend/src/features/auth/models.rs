use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use validator::Validate;

#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub username: String,
    pub email: String,
    pub password_hash: String,
    pub created_at: String,
    pub updated_at: String,
    // Optional device/login tracking and preferences
    #[sqlx(default)]
    pub last_login_ip: Option<String>,
    #[sqlx(default)]
    pub last_user_agent: Option<String>,
    #[sqlx(default)]
    pub last_login_at: Option<String>,
    #[sqlx(default)]
    pub notification_preferences: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Validate, Clone)]
pub struct RegisterUser {
    #[validate(length(min = 3, message = "Username must be at least 3 characters"))]
    pub username: String,

    #[validate(email(message = "Email must be valid"))]
    pub email: String,

    #[validate(length(min = 8, message = "Password must be at least 8 characters"))]
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize, Validate, Clone)]
pub struct LoginUser {
    #[validate(length(min = 3, message = "Identifier (email or username) must be at least 3 characters"))]
    pub identifier: String,

    #[validate(length(min = 8, message = "Password must be at least 8 characters"))]
    pub password: String,

    pub remember_me: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
    pub remember_me: bool,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct TokenClaims {
    pub sub: String,
    pub username: String,
    pub email: String,
    pub exp: i64,
    pub iat: i64,
}
