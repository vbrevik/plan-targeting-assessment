// ROE Repository
// Purpose: Database access layer for ROE requests and decision ROE status

use crate::features::roe::domain::{
    ROERequest, ROERequestStatus, ROEStatus, CreateROERequestRequest, UpdateROERequestStatusRequest,
};
use crate::features::roe::services::DecisionInfo;
use sqlx::{Pool, Sqlite, Row};
use uuid::Uuid;

pub struct ROERepository {
    pool: Pool<Sqlite>,
}

impl ROERepository {
    pub fn new(pool: Pool<Sqlite>) -> Self {
        Self { pool }
    }

    /// Create a new ROE request
    pub async fn create_roe_request(
        &self,
        user_id: &str,
        req: CreateROERequestRequest,
    ) -> Result<ROERequest, sqlx::Error> {
        let id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();

        // 1. Create the ROE Request (stored in separate table for now, or could be Entity)
        // Keeping as separate table per architecture decision to minimize risk
        sqlx::query(
            r#"
            INSERT INTO roe_requests (
                id, decision_id, requested_by, requested_at,
                approval_authority, request_justification, status,
                roe_reference, conditions, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            "#,
        )
        .bind(&id)
        .bind(&req.decision_id)
        .bind(user_id)
        .bind(&now)
        .bind(req.approval_authority.as_deref())
        .bind(&req.request_justification)
        .bind("pending")
        .bind(req.roe_reference.as_deref())
        .bind(req.conditions.as_deref())
        .bind(&now)
        .bind(&now)
        .execute(&self.pool)
        .await?;

        // 2. Update the Decision Entity properties
        self.update_decision_roe_status(
            &req.decision_id,
            Some("roe_pending_approval"),
            None,
            Some(&id)
        ).await?;

        // Fetch and return the created request
        self.get_roe_request_by_id(&id).await
    }

    /// Get ROE request by ID
    pub async fn get_roe_request_by_id(&self, id: &str) -> Result<ROERequest, sqlx::Error> {
        let row = sqlx::query(
            r#"
            SELECT id, decision_id, requested_by, requested_at,
                   approval_authority, request_justification, status,
                   approved_by, approved_at, rejection_reason,
                   roe_reference, expiration_date, conditions,
                   created_at, updated_at
            FROM roe_requests
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await?;

        Ok(self.row_to_roe_request(&row))
    }

    /// Get ROE request by decision ID
    pub async fn get_roe_request_by_decision_id(
        &self,
        decision_id: &str,
    ) -> Result<Option<ROERequest>, sqlx::Error> {
        let row = sqlx::query(
            r#"
            SELECT id, decision_id, requested_by, requested_at,
                   approval_authority, request_justification, status,
                   approved_by, approved_at, rejection_reason,
                   roe_reference, expiration_date, conditions,
                   created_at, updated_at
            FROM roe_requests
            WHERE decision_id = $1
            ORDER BY requested_at DESC
            LIMIT 1
            "#,
        )
        .bind(decision_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(|r| self.row_to_roe_request(&r)))
    }

    /// Update ROE request status
    pub async fn update_roe_request_status(
        &self,
        id: &str,
        req: UpdateROERequestStatusRequest,
        approved_by: &str,
    ) -> Result<ROERequest, sqlx::Error> {
        let status = ROERequestStatus::try_from(req.status.as_str())
            .map_err(|e| sqlx::Error::Decode(e.into()))?;

        let now = chrono::Utc::now().to_rfc3339();

        // Update the request
        sqlx::query(
            r#"
            UPDATE roe_requests
            SET status = $1, approved_by = $2, approved_at = $3,
                rejection_reason = $4, roe_reference = $5,
                expiration_date = $6, conditions = $7, updated_at = $8
            WHERE id = $9
            "#,
        )
        .bind(req.status.as_str())
        .bind(approved_by)
        .bind(if matches!(status, ROERequestStatus::Approved | ROERequestStatus::Rejected) {
            Some(&now)
        } else {
            None
        })
        .bind(req.rejection_reason.as_deref())
        .bind(req.roe_reference.as_deref())
        .bind(req.expiration_date.as_deref())
        .bind(req.conditions.as_deref())
        .bind(&now)
        .bind(id)
        .execute(&self.pool)
        .await?;

        // Determine new decision ROE status
        let decision_roe_status = match status {
            ROERequestStatus::Approved => "roe_approved",
            ROERequestStatus::Rejected => "roe_rejected",
            _ => "roe_pending_approval",
        };

        // Get decision_id from the request
        let decision_id_row = sqlx::query("SELECT decision_id FROM roe_requests WHERE id = $1")
            .bind(id)
            .fetch_one(&self.pool)
            .await?;
        let decision_id: String = decision_id_row.get("decision_id");

        // Update decision entity
        self.update_decision_roe_status(
            &decision_id,
            Some(decision_roe_status),
            None,
            None
        ).await?;

        self.get_roe_request_by_id(id).await
    }

    /// Get decision ROE status from Entity properties
    pub async fn get_decision_roe_status(
        &self,
        decision_id: &str,
    ) -> Result<(Option<String>, Option<String>, Option<String>), sqlx::Error> {
        let row = sqlx::query(
            r#"
            SELECT properties
            FROM entities
            WHERE id = $1
            "#,
        )
        .bind(decision_id)
        .fetch_optional(&self.pool)
        .await?;

        match row {
            Some(r) => {
                let props_str: String = r.get("properties");
                let props: serde_json::Value = serde_json::from_str(&props_str)
                    .map_err(|e| sqlx::Error::ColumnDecode { index: "properties".to_string(), source: Box::new(e) })?;
                
                let roe_status = props.get("roe_status").and_then(|v| v.as_str()).map(String::from);
                let roe_notes = props.get("roe_notes").and_then(|v| v.as_str()).map(String::from);
                let roe_request_id = props.get("roe_request_id").and_then(|v| v.as_str()).map(String::from);
                
                Ok((roe_status, roe_notes, roe_request_id))
            },
            None => Ok((None, None, None)),
        }
    }

    /// Update decision ROE status via JSON modification in SQLite
    pub async fn update_decision_roe_status(
        &self,
        decision_id: &str,
        roe_status: Option<&str>,
        roe_notes: Option<&str>,
        roe_request_id: Option<&str>,
    ) -> Result<(), sqlx::Error> {
        let mut tx = self.pool.begin().await?;
        
        // 1. Fetch current properties
        let row = sqlx::query("SELECT properties FROM entities WHERE id = $1")
            .bind(decision_id)
            .fetch_optional(&mut *tx)
            .await?;
            
        if let Some(r) = row {
            let props_str: String = r.get("properties");
            let mut props: serde_json::Value = serde_json::from_str(&props_str)
                .unwrap_or(serde_json::json!({}));
                
            // 2. Modify properties
            if let Some(s) = roe_status {
                props["roe_status"] = serde_json::json!(s);
            }
            if let Some(n) = roe_notes {
                props["roe_notes"] = serde_json::json!(n);
            }
            if let Some(rid) = roe_request_id {
                props["roe_request_id"] = serde_json::json!(rid);
            }
            
            // 3. Update properties
            sqlx::query("UPDATE entities SET properties = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2")
                .bind(props.to_string())
                .bind(decision_id)
                .execute(&mut *tx)
                .await?;
        }
        
        tx.commit().await?;
        Ok(())
    }

    /// List ROE requests by status
    pub async fn list_roe_requests_by_status(
        &self,
        status: Option<&str>,
    ) -> Result<Vec<ROERequest>, sqlx::Error> {
        let query = if let Some(status) = status {
            sqlx::query(
                r#"
                SELECT id, decision_id, requested_by, requested_at,
                       approval_authority, request_justification, status,
                       approved_by, approved_at, rejection_reason,
                       roe_reference, expiration_date, conditions,
                       created_at, updated_at
                FROM roe_requests
                WHERE status = $1
                ORDER BY requested_at DESC
                "#,
            )
            .bind(status)
        } else {
            sqlx::query(
                r#"
                SELECT id, decision_id, requested_by, requested_at,
                       approval_authority, request_justification, status,
                       approved_by, approved_at, rejection_reason,
                       roe_reference, expiration_date, conditions,
                       created_at, updated_at
                FROM roe_requests
                ORDER BY requested_at DESC
                "#,
            )
        };

        let rows = query.fetch_all(&self.pool).await?;

        Ok(rows.iter().map(|r| self.row_to_roe_request(r)).collect())
    }

    /// Get decision info from Entity for ROE determination
    pub async fn get_decision_info(
        &self,
        decision_id: &str,
    ) -> Result<Option<DecisionInfo>, sqlx::Error> {
        tracing::info!("Looking for decision entity with ID: {}", decision_id);
        
        let row = sqlx::query(
            r#"
            SELECT id, name, description, properties
            FROM entities
            WHERE id = $1
            "#,
        )
        .bind(decision_id)
        .fetch_optional(&self.pool)
        .await?;
        
        if row.is_none() {
            tracing::warn!("Decision entity not found for ID: {}", decision_id);
        } else {
            tracing::debug!("Found decision entity for ID: {}", decision_id);
        }

        Ok(row.map(|r| {
            let props_str: String = r.get("properties");
            let props: serde_json::Value = serde_json::from_str(&props_str).unwrap_or(serde_json::json!({}));
            
            let category = props.get("category")
                .and_then(|v| v.as_str())
                .unwrap_or("general")
                .to_string();
                
            DecisionInfo {
                id: r.get("id"),
                title: r.get("name"),
                description: r.get::<Option<String>, _>("description").unwrap_or_default(),
                category,
            }
        }))
    }

    /// Auto-determine and update ROE status for a decision
    pub async fn auto_determine_roe_status(
        &self,
        decision_id: &str,
    ) -> Result<(ROEStatus, Option<String>), sqlx::Error> {
        use crate::features::roe::services::ROEDeterminationService;
        
        // Get decision info
        let decision_info = match self.get_decision_info(decision_id).await? {
            Some(info) => info,
            None => return Err(sqlx::Error::RowNotFound),
        };

        // Determine ROE status
        let roe_status = ROEDeterminationService::determine_roe_status(&decision_info);
        
        // Generate ROE notes
        let roe_notes = ROEDeterminationService::generate_roe_notes(&decision_info, roe_status);

        // Update decision in database
        self.update_decision_roe_status(
            decision_id,
            Some(&roe_status.to_string()),
            roe_notes.as_deref(),
            None, // roe_request_id
        )
        .await?;

        Ok((roe_status, roe_notes))
    }

    /// Helper: Convert database row to ROERequest
    fn row_to_roe_request(&self, row: &sqlx::sqlite::SqliteRow) -> ROERequest {
        ROERequest {
            id: row.get("id"),
            decision_id: row.get("decision_id"),
            requested_by: row.get("requested_by"),
            requested_at: row.get("requested_at"),
            approval_authority: row.get("approval_authority"),
            request_justification: row.get("request_justification"),
            status: ROERequestStatus::try_from(
                row.get::<String, _>("status").as_str(),
            )
            .unwrap_or(ROERequestStatus::Pending),
            approved_by: row.get("approved_by"),
            approved_at: row.get("approved_at"),
            rejection_reason: row.get("rejection_reason"),
            roe_reference: row.get("roe_reference"),
            expiration_date: row.get("expiration_date"),
            conditions: row.get("conditions"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }
    }
}
