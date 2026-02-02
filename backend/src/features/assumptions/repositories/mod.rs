use super::domain::{Assumption, AssumptionSummary, CreateAssumptionRequest, UpdateAssumptionRequest};
use sqlx::{Pool, Sqlite};
use uuid::Uuid;

pub struct AssumptionRepository {
    pool: Pool<Sqlite>,
}

impl AssumptionRepository {
    pub fn new(pool: Pool<Sqlite>) -> Self {
        Self { pool }
    }

    pub async fn create_assumption(&self, req: CreateAssumptionRequest) -> Result<Assumption, sqlx::Error> {
        let id = Uuid::new_v4().to_string();
        let created_at = chrono::Utc::now();
        
        sqlx::query(
            r#"
            INSERT INTO entities (
                id, operation_id, campaign_id, name, type, description, status, 
                confidence, properties, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, 'ASSUMPTION', $5, 'Valid', $6, $7, $8, $8)
            "#
        )
        .bind(&id)
        .bind(&req.operation_id)
        .bind(&req.campaign_id)
        .bind(&req.title)
        .bind(&req.description)
        .bind(req.confidence_score.map(|s| s / 100.0).unwrap_or(0.5))
        .bind(sqlx::types::Json(serde_json::json!({
            "category": req.category,
            "stated_by": req.stated_by,
            "dependencies": req.dependencies.unwrap_or(serde_json::json!([])),
            "risk_level": "Low"
        })))
        .bind(created_at)
        .execute(&self.pool)
        .await?;

        // Return via ontology view
        self.get_assumption_by_id(&id).await?
            .ok_or(sqlx::Error::RowNotFound)
    }

    pub async fn get_all_assumptions(&self) -> Result<Vec<Assumption>, sqlx::Error> {
        sqlx::query_as::<_, Assumption>("SELECT * FROM v_assumptions_ontology ORDER BY created_at DESC")
            .fetch_all(&self.pool)
            .await
    }

    pub async fn get_assumption_by_id(&self, id: &str) -> Result<Option<Assumption>, sqlx::Error> {
        sqlx::query_as::<_, Assumption>("SELECT * FROM v_assumptions_ontology WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn get_assumptions_by_status(&self, status: &str) -> Result<Vec<Assumption>, sqlx::Error> {
        sqlx::query_as::<_, Assumption>(
            "SELECT * FROM v_assumptions_ontology WHERE status = $1 ORDER BY updated_at DESC"
        )
        .bind(status)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn get_assumptions_by_campaign(&self, campaign_id: &str) -> Result<Vec<Assumption>, sqlx::Error> {
        sqlx::query_as::<_, Assumption>(
            "SELECT * FROM v_assumptions_ontology WHERE campaign_id = $1 ORDER BY created_at DESC"
        )
        .bind(campaign_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn get_assumptions_by_operation(&self, operation_id: &str) -> Result<Vec<Assumption>, sqlx::Error> {
        sqlx::query_as::<_, Assumption>(
            "SELECT * FROM v_assumptions_ontology WHERE operation_id = $1 ORDER BY created_at DESC"
        )
        .bind(operation_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn update_assumption(
        &self,
        id: &str,
        req: UpdateAssumptionRequest,
    ) -> Result<Assumption, sqlx::Error> {
        let updated_at = chrono::Utc::now();

        // Verify assumption exists in ontology
        let existing = self.get_assumption_by_id(id).await?
            .ok_or(sqlx::Error::RowNotFound)?;

        // Build updated properties
        let mut props = serde_json::from_value::<serde_json::Value>(
            sqlx::query_scalar::<_, sqlx::types::JsonValue>("SELECT properties FROM entities WHERE id = $1")
                .bind(id)
                .fetch_one(&self.pool)
                .await?
        ).unwrap_or(serde_json::json!({}));

        if let Some(cat) = req.category { props["category"] = serde_json::json!(cat); }
        if let Some(risk) = req.risk_level { props["risk_level"] = serde_json::json!(risk); }
        if let Some(stated) = req.validated_by.clone() { props["validated_by"] = serde_json::json!(stated); props["last_validated_at"] = serde_json::json!(updated_at); }
        if let Some(deps) = req.dependencies { props["dependencies"] = deps; }
        if let Some(notes) = req.impact_notes { props["impact_notes"] = serde_json::json!(notes); }

        sqlx::query(
            r#"
            UPDATE entities
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                status = COALESCE($3, status),
                confidence = COALESCE($4, confidence),
                properties = $5,
                updated_at = $6
            WHERE id = $7 AND type = 'ASSUMPTION'
            "#
        )
        .bind(req.title)
        .bind(req.description)
        .bind(req.status)
        .bind(req.confidence_score.map(|s| s / 100.0))
        .bind(sqlx::types::Json(props))
        .bind(updated_at)
        .bind(id)
        .execute(&self.pool)
        .await?;

        self.get_assumption_by_id(id).await?
            .ok_or(sqlx::Error::RowNotFound)
    }

    pub async fn delete_assumption(&self, id: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM entities WHERE id = $1 AND type = 'ASSUMPTION'")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn get_summary(&self) -> Result<AssumptionSummary, sqlx::Error> {
        sqlx::query_as::<_, AssumptionSummary>(
            r#"
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Valid' THEN 1 ELSE 0 END) as valid,
                SUM(CASE WHEN status = 'Monitoring' THEN 1 ELSE 0 END) as monitoring,
                SUM(CASE WHEN status = 'Challenged' THEN 1 ELSE 0 END) as challenged,
                SUM(CASE WHEN status = 'Broken' THEN 1 ELSE 0 END) as broken,
                SUM(CASE WHEN json_extract(properties, '$.risk_level') = 'High' THEN 1 ELSE 0 END) as high_risk,
                SUM(CASE WHEN json_extract(properties, '$.risk_level') = 'Critical' THEN 1 ELSE 0 END) as critical_risk
            FROM entities
            WHERE type = 'ASSUMPTION'
            "#
        )
        .fetch_one(&self.pool)
        .await
    }
}
