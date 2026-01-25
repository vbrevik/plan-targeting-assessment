use std::net::SocketAddr;
use std::sync::Arc;
use axum::{Router, routing::get};
use crate::features::auth::service::AuthService;
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use sqlx::sqlite::SqlitePoolOptions;
mod utils;
mod features;
mod config;
mod middleware;

#[tokio::main]
async fn main() {
    // Initialize logging
    // Force rebuild 2
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load configuration
    config::init();
    // Load config into a mutable variable so we can inject generated key material if needed.
    // If loading fails, dump the runtime `config/default.toml` (if present) to help debugging.
    let mut config = match config::Config::from_env() {
        Ok(cfg) => cfg,
        Err(e) => {
            eprintln!("Failed to load config: {}", e);
            if let Ok(s) = std::fs::read_to_string("config/default.toml") {
                eprintln!("Contents of config/default.toml:\n{}", s);
                // Try to parse the default TOML manually as a fallback
                match toml::from_str::<config::Config>(&s) {
                    Ok(cfg) => {
                        eprintln!("Parsed config/default.toml successfully via toml::from_str, continuing with fallback config");
                        cfg
                    }
                    Err(parse_err) => {
                        eprintln!("Failed to parse config/default.toml with toml::from_str: {}", parse_err);
                        panic!("Failed to load config: {}", e);
                    }
                }
            } else {
                eprintln!("Could not read config/default.toml from working directory");
                panic!("Failed to load config: {}", e);
            }
        }
    };

    // Generate or load JWT keys (create on-disk keys if missing)
    if !utils::jwt_keys::check_keys_exist() {
        println!("JWT keys not found. Generating new keys...");
        utils::jwt_keys::generate_and_save_keys().expect("Failed to generate JWT keys");
    } else {
        // Check if keys need rotation
        if let Ok(age) = utils::key_rotation::get_key_age() {
            // Rotate keys every 90 days (7,776,000 seconds)
            if utils::key_rotation::is_key_expired(age, 7_776_000) {
                println!("JWT keys are expired. Rotating keys...");
                utils::key_rotation::rotate_keys().expect("Failed to rotate JWT keys");
            }
        }
    }

    // If config does not contain the JWT PEMs inline, attempt to load them from the generated key files
    if config.jwt_private_key.trim().is_empty() || config.jwt_public_key.trim().is_empty() {
        if utils::jwt_keys::check_keys_exist() {
            if let Ok((priv_pem, pub_pem)) = utils::jwt_keys::load_keys(&config) {
                config.jwt_private_key = priv_pem;
                config.jwt_public_key = pub_pem;
            }
        }
    }

    // Initialize database
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to database");

    // Run migrations with error handling for version mismatches
    match sqlx::migrate!().run(&pool).await {
        Ok(_) => tracing::info!("Migrations completed successfully"),
        Err(e) => {
            // Version mismatch can occur if migration files were modified
            // Log warning but continue - database may already be at correct state
            tracing::warn!("Migration warning: {:?}. Continuing...", e);
            // In production, you'd want more sophisticated error handling
        }
    }

    // Ensure notifications table exists (simple migration fallback)
    sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            message TEXT NOT NULL,
            read INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    "#)
    .execute(&pool)
    .await
    .expect("Failed to ensure notifications table");

    let config_arc = Arc::new(config.clone());

    // Create services (clonable for router state)
    let abac_service = features::abac::AbacService::new(pool.clone());
    let user_service = features::users::service::UserService::new(pool.clone());
    let auth_service = features::auth::service::AuthService::new(pool.clone(), config.clone(), abac_service.clone(), user_service.clone());
    let system_service = features::system::service::SystemService::new();
    let discovery_service = features::discovery::service::DiscoveryService::new();
    let rate_limit_service = Arc::new(features::rate_limit::RateLimitService::new(pool.clone(), false));
    let ontology_service = features::ontology::OntologyService::new(pool.clone());

    // Create router and attach state
    // API router contains feature routes and an API-scoped health check
    let api_router = Router::new()
        .route("/health", get(health_check))
        .nest("/discovery", 
            features::discovery::routes::discovery_routes()
                .with_state(discovery_service.clone())
        )
        .nest("/rate-limits",
            features::rate_limit::routes::public_rate_limit_routes()
                .with_state(rate_limit_service.clone())
                .layer(axum::middleware::from_fn(middleware::auth::auth_middleware))
                .layer(axum::middleware::from_fn(middleware::csrf::validate_csrf))
        )
        .nest("/auth", 
            Router::new()
                .merge(
                    features::auth::routes::public_auth_routes()
                )
                .merge(
                    features::auth::routes::protected_auth_routes()
                        .layer(axum::middleware::from_fn(middleware::auth::auth_middleware))
                        .layer(axum::middleware::from_fn(middleware::csrf::validate_csrf))
                )
        )
        .merge(
            features::dashboard::routes::dashboard_routes()
                .layer(axum::middleware::from_fn(middleware::auth::auth_middleware))
                .layer(axum::middleware::from_fn(middleware::csrf::validate_csrf))
        )
        .nest("/users", 
            features::users::routes::users_routes()
                .with_state(user_service)
                .layer(axum::middleware::from_fn(middleware::auth::auth_middleware))
                .layer(axum::middleware::from_fn(middleware::csrf::validate_csrf))
        )
        .nest("/system",
            features::system::routes::system_routes()
                .with_state(system_service)
                .layer(axum::middleware::from_fn(middleware::auth::auth_middleware))
                .layer(axum::middleware::from_fn(middleware::csrf::validate_csrf))
        )
        .nest("/abac", 
            features::abac::routes::abac_routes()
                .with_state(abac_service.clone())
                .layer(axum::middleware::from_fn(middleware::auth::auth_middleware))
                .layer(axum::middleware::from_fn(middleware::csrf::validate_csrf))
        )
        .nest("/operations",
            features::operations::router(pool.clone())
                .layer(axum::middleware::from_fn(middleware::auth::auth_middleware))
                .layer(axum::middleware::from_fn(middleware::csrf::validate_csrf))
        )
        .nest("/assumptions",
            features::assumptions::router::router(pool.clone())
                .layer(axum::middleware::from_fn(middleware::auth::auth_middleware))
                .layer(axum::middleware::from_fn(middleware::csrf::validate_csrf))
        )
        .nest("/targeting",
            {
                let realtime_service = std::sync::Arc::new(features::targeting::services::realtime::RealtimeService::new());
                features::targeting::create_router(pool.clone(), realtime_service)
                    .layer(axum::middleware::from_fn(middleware::auth::auth_middleware))
                    .layer(axum::middleware::from_fn(middleware::csrf::validate_csrf))
            }
        )
        .nest("/bda",
            features::bda::router(pool.clone())
                .layer(axum::middleware::from_fn(middleware::auth::auth_middleware))
                .layer(axum::middleware::from_fn(middleware::csrf::validate_csrf))
        )
        .nest("/roe",
            features::roe::router(pool.clone())
                .layer(axum::middleware::from_fn(middleware::auth::auth_middleware))
                .layer(axum::middleware::from_fn(middleware::csrf::validate_csrf))
        )
        .nest("/ontology",
            features::ontology::ontology_router(ontology_service.clone())
                .layer(axum::middleware::from_fn(middleware::auth::auth_middleware))
                .layer(axum::middleware::from_fn(middleware::csrf::validate_csrf))
        )
        .nest("/navigation",
            features::navigation::navigation_router::<AuthService>(ontology_service, abac_service)
                .layer(axum::middleware::from_fn(middleware::auth::auth_middleware))
                .layer(axum::middleware::from_fn(middleware::csrf::validate_csrf))
        );

    let app = Router::new()
        .route("/health", get(health_check))
        .nest("/api", api_router)
        .with_state(auth_service.clone())
        .layer(tower_cookies::CookieManagerLayer::new())
        .layer(axum::Extension(config_arc))
        .layer(CorsLayer::new().allow_origin(Any));

    // Start server
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!(%addr, "Server listening");

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>())
        .await
        .unwrap();
}

async fn health_check() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "status": "OK",
        "version": env!("CARGO_PKG_VERSION")
    }))
}
