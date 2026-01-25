// Script to reset IM user password
// Run with: cargo run --bin reset_im_password

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};
use sqlx::SqlitePool;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables
    dotenv::dotenv().ok();
    
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:data/app.db".to_string());
    
    let pool = SqlitePool::connect(&database_url).await?;
    
    // User credentials
    let email = "im@test.mil";
    let password = "Password123!";
    let username = "im";
    
    // Hash the password using Argon2
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| format!("Password hashing failed: {}", e))?
        .to_string();
    
    println!("Resetting IM user password:");
    println!("  Email: {}", email);
    println!("  Password: {}", password);
    
    // Check if user exists
    let user_exists: Option<(String,)> = sqlx::query_as("SELECT id FROM users WHERE email = $1")
        .bind(email)
        .fetch_optional(&pool)
        .await?;

    let user_id = if let Some((id,)) = user_exists {
        println!("User exists, updating password...");
        sqlx::query("UPDATE users SET password_hash = $1 WHERE id = $2")
            .bind(&password_hash)
            .bind(&id)
            .execute(&pool)
            .await?;
        id
    } else {
        println!("User does not exist, creating...");
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
        .bind(&password_hash)
        .execute(&pool)
        .await?;
        id
    };
    
    println!("✓ User credential updated successfully");
    
    // Ensure role assignment
    // Get the im role id
    let role: Option<(String,)> = sqlx::query_as("SELECT id FROM roles WHERE name = 'Information Manager' OR id = 'im'")
        .fetch_optional(&pool)
        .await?;
    
    if let Some((role_id,)) = role {
        println!("Assigning role: {}", role_id);
        // Assign the role to the user
        sqlx::query(
            r#"
            INSERT OR IGNORE INTO user_roles (user_id, role_id, resource_id)
            VALUES ($1, $2, NULL)
            "#
        )
        .bind(&user_id)
        .bind(&role_id)
        .execute(&pool)
        .await?;
        
        println!("✓ IM role assigned successfully");
    } else {
        eprintln!("⚠ Warning: IM role not found.");
    }
    
    Ok(())
}
