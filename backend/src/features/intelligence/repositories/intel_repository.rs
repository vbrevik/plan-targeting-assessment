use crate::features::intelligence::domain::{
    IntelFeed, IntelType, CreateIntelFeedRequest, UpdateIntelFeedRequest,
};
use sqlx::{Pool, Sqlite, Row};
use uuid::Uuid;

pub struct IntelRepository {
    pool: Pool<Sqlite>,
}

impl IntelRepository {
    pub fn new(pool: Pool<Sqlite>) -> Self {
        Self { pool }
    }

    pub async fn create(&self, req: CreateIntelFeedRequest) -> Result<IntelFeed, sqlx::Error> {
        let id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now();

        let intel_type_str = match req.intel_type {
            IntelType::Sigint => "sigint",
            IntelType::Osint => "osint",
            IntelType::Humint => "humint",
            IntelType::Geoint => "geoint",
            IntelType::Masint => "masint",
        };

        sqlx::query(
            r#"
            INSERT INTO intelligence_feeds (
                id, target_id, bda_report_id, intel_type, source_agency,
                raw_data, interpretation, confidence_score, reliability_rating,
                visibility_level, external_reference_id, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)
            "#
        )
        .bind(&id)
        .bind(&req.target_id)
        .bind(&req.bda_report_id)
        .bind(intel_type_str)
        .bind(&req.source_agency)
        .bind(&req.raw_data)
        .bind(&req.interpretation)
        .bind(req.confidence_score)
        .bind(&req.reliability_rating)
        .bind(&req.visibility_level)
        .bind(&req.external_reference_id)
        .bind(&now)
        .execute(&self.pool)
        .await?;

        self.get_by_id(&id).await?
            .ok_or(sqlx::Error::RowNotFound)
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<IntelFeed>, sqlx::Error> {
        let row = sqlx::query("SELECT * FROM intelligence_feeds WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;

        match row {
            Some(r) => Ok(Some(self.row_to_intel_feed(r)?)),
            None => Ok(None),
        }
    }

    pub async fn get_by_target(&self, target_id: &str) -> Result<Vec<IntelFeed>, sqlx::Error> {
        let rows = sqlx::query("SELECT * FROM intelligence_feeds WHERE target_id = $1 ORDER BY created_at DESC")
            .bind(target_id)
            .fetch_all(&self.pool)
            .await?;

        let mut feeds = Vec::new();
        for row in rows {
            feeds.push(self.row_to_intel_feed(row)?);
        }

        Ok(feeds)
    }

    pub async fn get_by_report(&self, report_id: &str) -> Result<Vec<IntelFeed>, sqlx::Error> {
        let rows = sqlx::query("SELECT * FROM intelligence_feeds WHERE bda_report_id = $1 ORDER BY created_at DESC")
            .bind(report_id)
            .fetch_all(&self.pool)
            .await?;

        let mut feeds = Vec::new();
        for row in rows {
            feeds.push(self.row_to_intel_feed(row)?);
        }

        Ok(feeds)
    }

    pub async fn update(&self, id: &str, req: UpdateIntelFeedRequest) -> Result<IntelFeed, sqlx::Error> {
        let now = chrono::Utc::now();

        sqlx::query(
            r#"
            UPDATE intelligence_feeds
            SET interpretation = COALESCE($1, interpretation),
                confidence_score = COALESCE($2, confidence_score),
                reliability_rating = COALESCE($3, reliability_rating),
                visibility_level = COALESCE($4, visibility_level),
                updated_at = $5
            WHERE id = $6
            "#
        )
        .bind(req.interpretation)
        .bind(req.confidence_score)
        .bind(req.reliability_rating)
        .bind(req.visibility_level)
        .bind(&now)
        .bind(id)
        .execute(&self.pool)
        .await?;

        self.get_by_id(id).await?
            .ok_or(sqlx::Error::RowNotFound)
    }

    pub async fn delete(&self, id: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM intelligence_feeds WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    fn row_to_intel_feed(&self, row: sqlx::sqlite::SqliteRow) -> Result<IntelFeed, sqlx::Error> {
        Ok(IntelFeed {
            id: row.get("id"),
            target_id: row.get("target_id"),
            bda_report_id: row.get("bda_report_id"),
            intel_type: self.parse_intel_type(row.get("intel_type")),
            source_agency: row.get("source_agency"),
            raw_data: row.get("raw_data"),
            interpretation: row.get("interpretation"),
            confidence_score: row.get("confidence_score"),
            reliability_rating: row.get("reliability_rating"),
            visibility_level: row.get("visibility_level"),
            external_reference_id: row.get("external_reference_id"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    fn parse_intel_type(&self, s: String) -> IntelType {
        match s.as_str() {
            "sigint" => IntelType::Sigint,
            "osint" => IntelType::Osint,
            "humint" => IntelType::Humint,
            "geoint" => IntelType::Geoint,
            "masint" => IntelType::Masint,
            _ => IntelType::Osint,
        }
    }
}
