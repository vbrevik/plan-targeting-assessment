// Script to clean IM user roles, ensuring they only have 'im' role
// Run with: cargo run --bin clean_im_roles

use sqlx::SqlitePool;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables
    dotenv::dotenv().ok();
    
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:data/app.db".to_string());
    
    let pool = SqlitePool::connect(&database_url).await?;
    
    let email = "im@test.mil";
    
    println!("Cleaning roles for user: {}", email);
    
    // Get user id
    let user: Option<(String,)> = sqlx::query_as("SELECT id FROM users WHERE email = $1")
        .bind(email)
        .fetch_optional(&pool)
        .await?;
        
    if let Some((user_id,)) = user {
        println!("User found, ID: {}", user_id);
        
        // Remove ALL roles
        sqlx::query("DELETE FROM user_roles WHERE user_id = $1")
            .bind(&user_id)
            .execute(&pool)
            .await?;
            
        println!("Removed all existing roles.");
        
        // Get 'im' role id
        let role: Option<(String,)> = sqlx::query_as("SELECT id FROM roles WHERE id = 'im' OR name = 'Information Manager'")
            .fetch_optional(&pool)
            .await?;
            
        if let Some((role_id,)) = role {
            println!("Assigning role: {}", role_id);
            // Assign ONLY im role
            sqlx::query(
                r#"
                INSERT INTO user_roles (user_id, role_id)
                VALUES ($1, $2)
                "#
            )
            .bind(&user_id)
            .bind(&role_id)
            .execute(&pool)
            .await?;
            
            println!("✓ Role 'im' assigned successfully.");
        } else {
            eprintln!("⚠ Error: 'im' role not found in database.");
        }
        
    } else {
        eprintln!("⚠ User {} not found.", email);
    }
    
    Ok(())
}
