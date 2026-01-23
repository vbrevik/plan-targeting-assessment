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
        
        let assumption = sqlx::query_as::<_, Assumption>(
            r#"
            INSERT INTO assumptions (
                id, operation_id, campaign_id, title, description, category, 
                status, risk_level, confidence_score, stated_by, dependencies,
                created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'Valid', 'Low', $7, $8, $9, $10, $10)
            RETURNING *
            "#
        )
        .bind(&id)
        .bind(&req.operation_id)
        .bind(&req.campaign_id)
        .bind(&req.title)
        .bind(&req.description)
        .bind(&req.category)
        .bind(req.confidence_score)
        .bind(&req.stated_by)
        .bind(req.dependencies.as_ref().map(|v| sqlx::types::Json(v.clone())))
        .bind(created_at)
        .fetch_one(&self.pool)
        .await?;

        Ok(assumption)
    }

    pub async fn get_all_assumptions(&self) -> Result<Vec<Assumption>, sqlx::Error> {
        sqlx::query_as::<_, Assumption>("SELECT * FROM assumptions ORDER BY created_at DESC")
            .fetch_all(&self.pool)
            .await
    }

    pub async fn get_assumption_by_id(&self, id: &str) -> Result<Option<Assumption>, sqlx::Error> {
        sqlx::query_as::<_, Assumption>("SELECT * FROM assumptions WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn get_assumptions_by_status(&self, status: &str) -> Result<Vec<Assumption>, sqlx::Error> {
        sqlx::query_as::<_, Assumption>(
            "SELECT * FROM assumptions WHERE status = $1 ORDER BY updated_at DESC"
        )
        .bind(status)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn get_assumptions_by_campaign(&self, campaign_id: &str) -> Result<Vec<Assumption>, sqlx::Error> {
        sqlx::query_as::<_, Assumption>(
            "SELECT * FROM assumptions WHERE campaign_id = $1 ORDER BY created_at DESC"
        )
        .bind(campaign_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn get_assumptions_by_operation(&self, operation_id: &str) -> Result<Vec<Assumption>, sqlx::Error> {
        sqlx::query_as::<_, Assumption>(
            "SELECT * FROM assumptions WHERE operation_id = $1 ORDER BY created_at DESC"
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

        // Verify assumption exists
        let _existing = self.get_assumption_by_id(id).await?
            .ok_or(sqlx::Error::RowNotFound)?;

        // Build update query dynamically
        let assumption = sqlx::query_as::<_, Assumption>(
            r#"
            UPDATE assumptions
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                category = COALESCE($3, category),
                status = COALESCE($4, status),
                risk_level = COALESCE($5, risk_level),
                confidence_score = COALESCE($6, confidence_score),
                validated_by = COALESCE($7, validated_by),
                last_validated_at = CASE WHEN $7 IS NOT NULL THEN $8 ELSE last_validated_at END,
                dependencies = COALESCE($9, dependencies),
                impact_notes = COALESCE($10, impact_notes),
                updated_at = $8
            WHERE id = $11
            RETURNING *
            "#
        )
        .bind(req.title)
        .bind(req.description)
        .bind(req.category)
        .bind(req.status)
        .bind(req.risk_level)
        .bind(req.confidence_score)
        .bind(&req.validated_by)
        .bind(updated_at)
        .bind(req.dependencies.as_ref().map(|v| sqlx::types::Json(v.clone())))
        .bind(req.impact_notes)
        .bind(id)
        .fetch_one(&self.pool)
        .await?;

        Ok(assumption)
    }

    pub async fn delete_assumption(&self, id: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM assumptions WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn get_summary(&self) -> Result<AssumptionSummary, sqlx::Error> {
        let summary = sqlx::query_as::<_, AssumptionSummary>(
            r#"
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Valid' THEN 1 ELSE 0 END) as valid,
                SUM(CASE WHEN status = 'Monitoring' THEN 1 ELSE 0 END) as monitoring,
                SUM(CASE WHEN status = 'Challenged' THEN 1 ELSE 0 END) as challenged,
                SUM(CASE WHEN status = 'Broken' THEN 1 ELSE 0 END) as broken,
                SUM(CASE WHEN risk_level = 'High' THEN 1 ELSE 0 END) as high_risk,
                SUM(CASE WHEN risk_level = 'Critical' THEN 1 ELSE 0 END) as critical_risk
            FROM assumptions
            "#
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(summary)
    }
}
