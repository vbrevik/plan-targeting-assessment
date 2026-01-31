// Script to setup Assistant-IM user and role
// Run with: cargo run --bin setup_assistant_im

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
    
    println!("Setting up Assistant-IM...");
    
    // 1. Create Assistant-IM Role
    let role_id = "assistant-im";
    let role_name = "Assistant-IM";
    
    // Ensure role exists
    sqlx::query(
        r#"
        INSERT INTO roles (id, name, description, created_at) 
        VALUES ($1, $2, 'Assistant Information Manager with restricted approvals', datetime('now'))
        ON CONFLICT(id) DO NOTHING
        "#
    )
    .bind(role_id)
    .bind(role_name)
    .execute(&pool)
    .await?;
    
    // 2. Assign Permissions (Same menu as IM + dashboard)
    // We assign `im.dashboard.view` to give them the IM Dashboard and Menu
    // We assign other view permissions but maybe NOT manage permissions (demonstrating "less independent approvals")
    
    let perms = vec![
        "im.dashboard.view", 
        "rfis.view", 
        "ontology.view", 
        "digital_twin.view", 
        "cop.view", 
        "rxp.view", 
        "documents.view"
        // NOT assigning 'menu.manage' or 'tor.manage' to differentiate from full IM
    ];
    
    for perm in perms {
        sqlx::query(
            "INSERT INTO permissions (role_id, action, created_at) VALUES ($1, $2, datetime('now')) ON CONFLICT(role_id, action) DO NOTHING"
        )
        .bind(role_id)
        .bind(perm)
        .execute(&pool)
        .await?;
    }
    
    println!("✓ Role setup complete.");

    // 3. Create User
    let email = "assistant_im@test.mil";
    let password = "Password123!";
    let username = "assistant_im";
    
    // Hash password
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| format!("Password hashing failed: {}", e))?
        .to_string();
        
    // Check/Create User
    let user_exists: Option<(String,)> = sqlx::query_as("SELECT id FROM users WHERE email = $1")
        .bind(email)
        .fetch_optional(&pool)
        .await?;

    let user_id = if let Some((id,)) = user_exists {
        sqlx::query("UPDATE users SET password_hash = $1 WHERE id = $2")
            .bind(&password_hash)
            .bind(&id)
            .execute(&pool)
            .await?;
        id
    } else {
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
    
    // Clean roles
    sqlx::query("DELETE FROM user_roles WHERE user_id = $1")
        .bind(&user_id)
        .execute(&pool)
        .await?;
        
    // Assign role
    sqlx::query("INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)")
        .bind(&user_id)
        .bind(role_id)
        .execute(&pool)
        .await?;
        
    println!("✓ User setup complete: {}", email);
    
    Ok(())
}
