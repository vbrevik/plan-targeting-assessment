use axum::Router;
use sqlx::SqlitePool;

pub fn admn_routes<S>(pool: SqlitePool) -> Router<S>
where
    S: Clone + Send + Sync + 'static,
{
    let user_service = admn_users::UserService::new(pool.clone());
    let abac_service = admn_abac::AbacService::new(pool.clone());
    let system_service = admn_system::SystemService::new();
    let rate_limit_service = std::sync::Arc::new(admn_rate_limit::RateLimitService::new(pool.clone(), false));

    Router::new()
        .nest("/users", admn_users::users_routes().with_state(user_service))
        .nest("/abac", admn_abac::routes::abac_routes().with_state(abac_service))
        .nest("/system", admn_system::routes::system_routes().with_state(system_service))
        .nest("/rate-limits", admn_rate_limit::public_rate_limit_routes().with_state(rate_limit_service))
}
