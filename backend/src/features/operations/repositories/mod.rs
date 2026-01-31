use super::domain::{Campaign, CreateCampaignRequest, CreateOperationRequest, Operation};
use sqlx::{Pool, Sqlite};
use uuid::Uuid;

pub struct MshnCtrlRepository {
    pool: Pool<Sqlite>,
}

impl MshnCtrlRepository {
    pub fn new(pool: Pool<Sqlite>) -> Self {
        Self { pool }
    }

    // --- Campaign Methods ---

    pub async fn create_campaign(&self, req: CreateCampaignRequest) -> Result<Campaign, sqlx::Error> {
        let id = Uuid::new_v4().to_string();
        let created_at = chrono::Utc::now();
        
        let campaign = sqlx::query_as::<_, Campaign>(
            r#"
            INSERT INTO campaigns (id, name, status, objective, start_date, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $6)
            RETURNING *
            "#
        )
        .bind(id)
        .bind(req.name)
        .bind(req.status)
        .bind(req.objective)
        .bind(req.start_date)
        .bind(created_at)
        .fetch_one(&self.pool)
        .await?;

        Ok(campaign)
    }

    pub async fn get_campaigns(&self) -> Result<Vec<Campaign>, sqlx::Error> {
        sqlx::query_as::<_, Campaign>("SELECT * FROM campaigns ORDER BY created_at DESC")
            .fetch_all(&self.pool)
            .await
    }

    pub async fn get_campaign_by_id(&self, id: &str) -> Result<Option<Campaign>, sqlx::Error> {
        sqlx::query_as::<_, Campaign>("SELECT * FROM campaigns WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    // --- Operation Methods ---

    pub async fn create_operation(&self, req: CreateOperationRequest) -> Result<Operation, sqlx::Error> {
        let id = Uuid::new_v4().to_string();
        let created_at = chrono::Utc::now();
        
        let operation = sqlx::query_as::<_, Operation>(
            r#"
            INSERT INTO operations (id, campaign_id, name, current_phase, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $6)
            RETURNING *
            "#
        )
        .bind(id)
        .bind(req.campaign_id)
        .bind(req.name)
        .bind(req.current_phase)
        .bind(req.status)
        .bind(created_at)
        .fetch_one(&self.pool)
        .await?;

        Ok(operation)
    }

    pub async fn get_operations_by_campaign(&self, campaign_id: &str) -> Result<Vec<Operation>, sqlx::Error> {
        sqlx::query_as::<_, Operation>("SELECT * FROM operations WHERE campaign_id = $1 ORDER BY created_at DESC")
            .bind(campaign_id)
            .fetch_all(&self.pool)
            .await
    }
}
