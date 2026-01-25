// Script to setup verification users for J4 and Targeting
// Run with: cargo run --bin setup_verification_users

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};
use sqlx::{SqlitePool, Row};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables
    dotenv::dotenv().ok();
    
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:data/app.db".to_string());
    
    let pool = SqlitePool::connect(&database_url).await?;
    
    println!("Setting up verification users...");
    
    // Hash password
    let password = "Password123!";
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| format!("Password hashing failed: {}", e))?
        .to_string();

    // 1. Setup J4 User
    let j4_role_id = ensure_role(&pool, "j4-log", "J4 Logistics").await?;
    setup_user(&pool, "j4@test.mil", "j4_logistics", &password_hash, &j4_role_id).await?;
    
    // 2. Setup Targeting User
    let targeting_role_id = ensure_role(&pool, "targeting-cell", "Targeting Cell").await?;
    // Note: Migration uses 'targeting_cell' as name, but we can verify/fallback
    let actual_targeting_role_id = find_role_by_name(&pool, "targeting_cell").await
        .unwrap_or(targeting_role_id);
    
    setup_user(&pool, "targeting@test.mil", "targeting_operator", &password_hash, &actual_targeting_role_id).await?;
    
    println!("✓ Verification users setup complete.");
    
    Ok(())
}

async fn find_role_by_name(pool: &SqlitePool, name: &str) -> Option<String> {
    sqlx::query("SELECT id FROM roles WHERE name = $1")
        .bind(name)
        .fetch_optional(pool)
        .await
        .ok()??
        .try_get("id")
        .ok()
}

async fn ensure_role(pool: &SqlitePool, id_hint: &str, name_hint: &str) -> Result<String, Box<dyn std::error::Error>> {
    // Try find by ID
    let by_id: Option<(String,)> = sqlx::query_as("SELECT id FROM roles WHERE id = $1")
        .bind(id_hint)
        .fetch_optional(pool)
        .await?;
        
    if let Some((id,)) = by_id {
        return Ok(id);
    }
    
    // Try find by Name
    let by_name: Option<(String,)> = sqlx::query_as("SELECT id FROM roles WHERE name = $1")
        .bind(name_hint)
        .fetch_optional(pool)
        .await?;
        
    if let Some((id,)) = by_name {
        return Ok(id);
    }
    
    // Create if not exists
    println!("Creating role: {}", name_hint);
    sqlx::query("INSERT INTO roles (id, name, description, created_at) VALUES ($1, $2, 'Auto-generated for verification', datetime('now'))")
        .bind(id_hint)
        .bind(name_hint)
        .execute(pool)
        .await?;
        
    Ok(id_hint.to_string())
}

async fn setup_user(pool: &SqlitePool, email: &str, username: &str, password_hash: &str, role_id: &str) -> Result<(), Box<dyn std::error::Error>> {
    println!("Setting up user: {}", email);
    
    // Check if user exists
    let user_exists: Option<(String,)> = sqlx::query_as("SELECT id FROM users WHERE email = $1")
        .bind(email)
        .fetch_optional(pool)
        .await?;

    let user_id = if let Some((id,)) = user_exists {
        // Update password
        sqlx::query("UPDATE users SET password_hash = $1 WHERE id = $2")
            .bind(password_hash)
            .bind(&id)
            .execute(pool)
            .await?;
        id
    } else {
        // Create user
        let id = uuid::Uuid::new_v4().to_string();
        sqlx::query(
            r#"
            INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
            VALUES ($1, $2, $3, $4, datetime('now'), datetime('now'))
            "#
        )
        .bind(&id)
        .bind(username)
        .bind(email)
        .bind(password_hash)
        .execute(pool)
        .await?;
        id
    };
    
    // Clean existing roles
    sqlx::query("DELETE FROM user_roles WHERE user_id = $1")
        .bind(&user_id)
        .execute(pool)
        .await?;
        
    // Assign role
    println!("Assigning role {} to user {}", role_id, email);
    sqlx::query(
        r#"
        INSERT INTO user_roles (user_id, role_id)
        VALUES ($1, $2)
        "#
    )
    .bind(&user_id)
    .bind(role_id)
    .execute(pool)
    .await?;
    
    println!("✓ User {} ready.", email);
    Ok(())
}
