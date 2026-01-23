// Script to create a test user with targeting_cell role
// Run with: cargo run --bin create_test_user

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
    let user_id = "targeting-cell-test-001";
    let username = "targeting_cell_test";
    let email = "targeting_cell@test.mil";
    let password = "TargetingCell2026!";
    
    // Hash the password using Argon2
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| format!("Password hashing failed: {}", e))?
        .to_string();
    
    println!("Creating test user:");
    println!("  Username: {}", username);
    println!("  Email: {}", email);
    println!("  Password: {}", password);
    
    // Insert the user
    sqlx::query(
        r#"
        INSERT OR IGNORE INTO users (id, username, email, password_hash, created_at, updated_at)
        VALUES ($1, $2, $3, $4, datetime('now'), datetime('now'))
        "#
    )
    .bind(user_id)
    .bind(username)
    .bind(email)
    .bind(&password_hash)
    .execute(&pool)
    .await?;
    
    println!("✓ User created successfully");
    
    // Get the targeting_cell role id
    let role: Option<(String,)> = sqlx::query_as("SELECT id FROM roles WHERE name = 'targeting_cell'")
        .fetch_optional(&pool)
        .await?;
    
    if let Some((role_id,)) = role {
        // Assign the targeting_cell role to the user
        sqlx::query(
            r#"
            INSERT OR IGNORE INTO user_roles (user_id, role_id, resource_id)
            VALUES ($1, $2, NULL)
            "#
        )
        .bind(user_id)
        .bind(&role_id)
        .execute(&pool)
        .await?;
        
        println!("✓ Targeting cell role assigned successfully");
    } else {
        eprintln!("⚠ Warning: targeting_cell role not found. Make sure to run migrations first.");
    }
    
    // Verify the user and their permissions
    let permissions: Vec<(String,)> = sqlx::query_as(
        r#"
        SELECT DISTINCT p.action
        FROM user_roles ur
        JOIN permissions p ON ur.role_id = p.role_id
        WHERE ur.user_id = $1
        ORDER BY p.action
        "#
    )
    .bind(user_id)
    .fetch_all(&pool)
    .await?;
    
    println!("\n✓ User created with the following permissions:");
    for (action,) in permissions {
        println!("  - {}", action);
    }
    
    println!("\n===========================================");
    println!("Test user credentials:");
    println!("  Username/Email: {}", email);
    println!("  Password: {}", password);
    println!("===========================================");
    
    Ok(())
}
