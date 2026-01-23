// Script to reset a user's password
// Run with: cargo run --bin reset_user_password -- <email> <new_password>
// Example: cargo run --bin reset_user_password -- vidar@brevik.net "Password123."

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};
use sqlx::SqlitePool;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables
    dotenv::dotenv().ok();
    
    // Get command line arguments
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("Usage: cargo run --bin reset_user_password -- <email> <new_password>");
        eprintln!("Example: cargo run --bin reset_user_password -- vidar@brevik.net \"Password123.\"");
        std::process::exit(1);
    }
    
    let email = &args[1];
    let password = &args[2];
    
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:data/app.db".to_string());
    
    let pool = SqlitePool::connect(&database_url).await?;
    
    // Check if user exists
    let user: Option<(String, String)> = sqlx::query_as(
        "SELECT id, username FROM users WHERE email = ?"
    )
    .bind(email)
    .fetch_optional(&pool)
    .await?;
    
    if user.is_none() {
        eprintln!("❌ User with email '{}' not found in database", email);
        eprintln!("   Creating new user...");
        
        // Create new user
        let user_id = uuid::Uuid::new_v4().to_string();
        let username = email.split('@').next().unwrap_or("user");
        
        // Hash the password using Argon2
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| format!("Password hashing failed: {}", e))?
            .to_string();
        
        sqlx::query(
            r#"
            INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
            VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
            "#
        )
        .bind(&user_id)
        .bind(username)
        .bind(email)
        .bind(&password_hash)
        .execute(&pool)
        .await?;
        
        println!("✓ User created successfully");
        println!("  Email: {}", email);
        println!("  Username: {}", username);
        println!("  Password: {}", password);
        
        return Ok(());
    }
    
    let (user_id, username) = user.unwrap();
    
    println!("Found user:");
    println!("  ID: {}", user_id);
    println!("  Username: {}", username);
    println!("  Email: {}", email);
    println!("\nResetting password...");
    
    // Hash the new password using Argon2
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| format!("Password hashing failed: {}", e))?
        .to_string();
    
    // Update password in database
    sqlx::query(
        r#"
        UPDATE users 
        SET password_hash = ?, updated_at = datetime('now')
        WHERE email = ?
        "#
    )
    .bind(&password_hash)
    .bind(email)
    .execute(&pool)
    .await?;
    
    println!("✓ Password reset successfully");
    println!("\n===========================================");
    println!("Updated credentials:");
    println!("  Email: {}", email);
    println!("  Password: {}", password);
    println!("===========================================");
    
    Ok(())
}
