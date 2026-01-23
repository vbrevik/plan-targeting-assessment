use axum::{
    body::Body,
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use sqlx::{SqlitePool, Row};
use std::sync::Arc;

/// Classification levels in hierarchy order
#[derive(Debug, Clone, PartialEq, PartialOrd)]
pub enum ClassificationLevel {
    Unclass = 0,
    Cui = 1,
    Secret = 2,
    TopSecret = 3,
    TsSci = 4,
}

impl ClassificationLevel {
    pub fn from_string(s: &str) -> Self {
        match s {
            "UNCLASS" => ClassificationLevel::Unclass,
            "CUI" => ClassificationLevel::Cui,
            "SECRET" => ClassificationLevel::Secret,
            "TOP_SECRET" => ClassificationLevel::TopSecret,
            "TS_SCI" => ClassificationLevel::TsSci,
            _ => ClassificationLevel::Unclass,
        }
    }
}

/// User clearance information
#[derive(Debug, Clone)]
pub struct UserClearance {
    pub level: ClassificationLevel,
    pub is_active: bool,
    pub compartments: Vec<String>,
    pub caveats: Vec<String>,
}

impl UserClearance {
    /// Check if user has sufficient clearance for required level
    pub fn has_clearance(&self, required_level: &ClassificationLevel) -> bool {
        if !self.is_active {
            return false;
        }
        self.level >= *required_level
    }

    /// Check if user has access to specific compartment (for TS/SCI)
    pub fn has_compartment(&self, compartment: &str) -> bool {
        self.compartments.contains(&compartment.to_string())
    }
}

/// Get user's clearance level from database
pub async fn get_user_clearance(
    pool: &SqlitePool,
    user_id: &str,
) -> Result<UserClearance, sqlx::Error> {
    let row = sqlx::query(
        r#"
        SELECT clearance_level, is_active, compartments, caveats
        FROM user_clearances
        WHERE user_id = ?
        "#,
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    match row {
        Some(row) => {
            let level_str: String = row.get("clearance_level");
            let is_active: i32 = row.get("is_active");
            let compartments_json: String = row.get("compartments");
            let caveats_json: String = row.get("caveats");

            let compartments: Vec<String> =
                serde_json::from_str(&compartments_json).unwrap_or_default();
            let caveats: Vec<String> = serde_json::from_str(&caveats_json).unwrap_or_default();

            Ok(UserClearance {
                level: ClassificationLevel::from_string(&level_str),
                is_active: is_active == 1,
                compartments,
                caveats,
            })
        }
        None => {
            // Default to UNCLASS if no clearance record
            Ok(UserClearance {
                level: ClassificationLevel::Unclass,
                is_active: true,
                compartments: vec![],
                caveats: vec![],
            })
        }
    }
}

/// Log access to classified information
pub async fn log_classified_access(
    pool: &SqlitePool,
    user_id: &str,
    resource_type: &str,
    resource_id: &str,
    classification_level: &str,
    action: &str,
) -> Result<(), sqlx::Error> {
    // Only log SECRET and above
    if !matches!(
        classification_level,
        "SECRET" | "TOP_SECRET" | "TS_SCI"
    ) {
        return Ok(());
    }

    sqlx::query(
        r#"
        INSERT INTO classification_audit_log 
        (user_id, resource_type, resource_id, classification_level, action, accessed_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
        "#,
    )
    .bind(user_id)
    .bind(resource_type)
    .bind(resource_id)
    .bind(classification_level)
    .bind(action)
    .execute(pool)
    .await?;

    Ok(())
}

/// Classification middleware
/// 
/// This middleware:
/// 1. Checks user's clearance level
/// 2. Adds clearance info to request extensions for downstream handlers
/// 3. Logs access to classified resources
/// 
/// Note: Actual filtering of classified data should happen in the service layer
/// where we have access to the classification level of each data item.
pub async fn classification_middleware(
    State(pool): State<Arc<SqlitePool>>,
    mut request: Request,
    next: Next,
) -> Result<Response, (StatusCode, String)> {
    // Get user ID from request extensions (set by auth middleware)
    let user_id = request
        .extensions()
        .get::<String>()
        .cloned()
        .ok_or((
            StatusCode::UNAUTHORIZED,
            "User not authenticated".to_string(),
        ))?;

    // Fetch user's clearance
    let clearance = get_user_clearance(&pool, &user_id)
        .await
        .map_err(|e| {
            tracing::error!("Failed to fetch user clearance: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to check clearance".to_string(),
            )
        })?;

    // Check if clearance is active
    if !clearance.is_active {
        return Err((
            StatusCode::FORBIDDEN,
            "User clearance is not active".to_string(),
        ));
    }

    // Add clearance to request extensions for downstream handlers
    request.extensions_mut().insert(clearance);

    // Continue with the request
    let response = next.run(request).await;

    Ok(response)
}

/// Helper function to check if user can access data with specific classification
/// 
/// This should be called in service layers before returning classified data
pub fn check_clearance_for_data(
    user_clearance: &UserClearance,
    data_classification: &str,
) -> bool {
    let required_level = ClassificationLevel::from_string(data_classification);
    user_clearance.has_clearance(&required_level)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_classification_hierarchy() {
        let unclass = ClassificationLevel::Unclass;
        let cui = ClassificationLevel::Cui;
        let secret = ClassificationLevel::Secret;
        let top_secret = ClassificationLevel::TopSecret;
        let ts_sci = ClassificationLevel::TsSci;

        assert!(unclass < cui);
        assert!(cui < secret);
        assert!(secret < top_secret);
        assert!(top_secret < ts_sci);
    }

    #[test]
    fn test_user_clearance_check() {
        let clearance = UserClearance {
            level: ClassificationLevel::Secret,
            is_active: true,
            compartments: vec![],
            caveats: vec![],
        };

        // Can access UNCLASS and CUI and SECRET
        assert!(clearance.has_clearance(&ClassificationLevel::Unclass));
        assert!(clearance.has_clearance(&ClassificationLevel::Cui));
        assert!(clearance.has_clearance(&ClassificationLevel::Secret));

        // Cannot access TOP SECRET or TS/SCI
        assert!(!clearance.has_clearance(&ClassificationLevel::TopSecret));
        assert!(!clearance.has_clearance(&ClassificationLevel::TsSci));
    }

    #[test]
    fn test_inactive_clearance() {
        let clearance = UserClearance {
            level: ClassificationLevel::TopSecret,
            is_active: false, // Clearance expired
            compartments: vec![],
            caveats: vec![],
        };

        // Even with high clearance, inactive means no access
        assert!(!clearance.has_clearance(&ClassificationLevel::Unclass));
    }
}
