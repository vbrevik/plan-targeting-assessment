// NATO COPD Targeting Cell - API Handlers

use axum::{
    extract::{Path, Query, State, Extension},
    http::StatusCode,
    response::{IntoResponse, Json},
};
use serde::Deserialize;
use sqlx::{Pool, Sqlite, Row};
use crate::features::auth::jwt::Claims;

use crate::features::targeting::domain::*;
use crate::features::targeting::repositories::*;

#[cfg(test)]
mod tests;

#[cfg(test)]
mod tests_realtime;

#[cfg(test)]
mod tests_historical;

pub mod action_required;
pub use action_required::get_action_required;

pub mod search;
pub use search::search;

pub mod realtime;
pub use realtime::events_stream_handler;

pub mod historical;
pub use historical::{get_historical_status, get_historical_f3ead, get_historical_bda};

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

#[derive(Debug, Deserialize)]
pub struct TargetQueryParams {
    pub status: Option<String>,
    pub priority: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct PlatformQueryParams {
    pub status: Option<String>,
}

// ============================================================================
// TARGET HANDLERS
// ============================================================================

pub async fn list_targets(
    State(pool): State<Pool<Sqlite>>,
    Query(params): Query<TargetQueryParams>,
) -> Result<impl IntoResponse, StatusCode> {
    let targets = TargetRepository::list_all(&pool, params.status.as_deref(), params.priority.as_deref(), params.limit, params.offset)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(targets))
}

pub async fn create_target(
    State(pool): State<Pool<Sqlite>>,
    Extension(_claims): Extension<Claims>,
    Json(req): Json<CreateTargetRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    // Validate required fields
    if req.name.is_empty() || req.target_type.is_empty() || req.priority.is_empty() || req.coordinates.is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }
    
    // Validate target_type enum
    let valid_types = ["HPT", "TST", "HVT", "TGT"];
    if !valid_types.contains(&req.target_type.as_str()) {
        return Err(StatusCode::BAD_REQUEST);
    }
    
    // Validate priority enum
    let valid_priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    if !valid_priorities.contains(&req.priority.as_str()) {
        return Err(StatusCode::BAD_REQUEST);
    }
    
    // Default classification if not provided
    let classification = if req.classification.is_empty() {
        "SECRET"
    } else {
        &req.classification
    };
    
    // Create target
    let id = TargetRepository::create(
        &pool,
        &req.name,
        req.description.as_deref(),
        &req.target_type,
        &req.priority,
        &req.coordinates,
        classification,
    )
    .await
    .map_err(|e| {
        tracing::error!("Failed to create target: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    
    Ok((StatusCode::CREATED, Json(serde_json::json!({
        "id": id,
        "message": "Target created successfully"
    }))))
}

pub async fn get_target(
    State(pool): State<Pool<Sqlite>>,
    Path(id): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let target = TargetRepository::get_by_id(&pool, &id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    match target {
        Some(t) => Ok(Json(t)),
        None => Err(StatusCode::NOT_FOUND)
    }
}

pub async fn update_target(
    State(pool): State<Pool<Sqlite>>,
    Path(id): Path<String>,
    Json(req): Json<UpdateTargetRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    // Validate target exists
    let target = TargetRepository::get_by_id(&pool, &id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;
    
    // Validate priority if provided
    if let Some(ref p) = req.priority {
        let valid_priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
        if !valid_priorities.contains(&p.as_str()) {
            return Err(StatusCode::BAD_REQUEST);
        }
    }
    
    // Validate target_status if provided
    if let Some(ref s) = req.target_status {
        let valid_statuses = ["Nominated", "Validated", "Approved", "Engaged", "Assessed"];
        if !valid_statuses.contains(&s.as_str()) {
            return Err(StatusCode::BAD_REQUEST);
        }
    }
    
    // Update target
    TargetRepository::update(
        &pool,
        &id,
        req.name.as_deref(),
        req.priority.as_deref(),
        req.target_status.as_deref(),
    )
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Return updated target
    let updated = TargetRepository::get_by_id(&pool, &id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;
    
    Ok(Json(updated))
}

pub async fn delete_target(
    State(_pool): State<Pool<Sqlite>>,
    Path(_id): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    Ok(StatusCode::NO_CONTENT)
}

pub async fn get_target_timeline(
    State(pool): State<Pool<Sqlite>>,
    Path(id): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    // Build timeline from multiple sources:
    // 1. Target status changes (from targets table updated_at)
    // 2. DTL entries (when target was added to DTL)
    // 3. JTB decisions (if target was in JTB session)
    // 4. BDA assessments (if target was struck)
    // 5. Decision log entries (if target was mentioned)
    // 6. Annotations (user comments on target)
    
    let mut timeline: Vec<serde_json::Value> = Vec::new();
    
    // Get target creation and updates
    if let Ok(Some(target)) = TargetRepository::get_by_id(&pool, &id).await {
        timeline.push(serde_json::json!({
            "timestamp": target.id, // Use id as placeholder - would need created_at field
            "type": "TARGET_CREATED",
            "description": format!("Target {} created", target.name),
            "actor": "system",
        }));
    }
    
    // Get DTL entries for this target
    if let Ok(dtl_entries) = sqlx::query("SELECT id, created_at, updated_at, priority_score, feasibility_score FROM dtl_entries WHERE target_id = ? ORDER BY created_at DESC")
        .bind(&id)
        .fetch_all(&pool)
        .await {
        for row in dtl_entries {
            let created_at: String = row.get("created_at");
            timeline.push(serde_json::json!({
                "timestamp": created_at,
                "type": "DTL_ADDED",
                "description": format!("Added to DTL with priority score {:.2}", row.get::<f64, _>("priority_score")),
                "actor": "system",
            }));
        }
    }
    
    // Get JTB decisions for this target
    if let Ok(jtb_targets) = sqlx::query(
        "SELECT jt.decision, jt.decided_at, jt.decided_by, js.session_name 
         FROM jtb_targets jt 
         JOIN jtb_sessions js ON jt.session_id = js.id 
         WHERE jt.target_id = ? AND jt.decision IS NOT NULL 
         ORDER BY jt.decided_at DESC"
    )
    .bind(&id)
    .fetch_all(&pool)
    .await {
        for row in jtb_targets {
            let decided_at: Option<String> = row.get("decided_at");
            let decision: Option<String> = row.get("decision");
            let decided_by: Option<String> = row.get("decided_by");
            let session_name: Option<String> = row.get("session_name");
            
            if let (Some(at), Some(dec)) = (decided_at, decision) {
                timeline.push(serde_json::json!({
                    "timestamp": at,
                    "type": "JTB_DECISION",
                    "description": format!("JTB decision: {} in session {}", dec, session_name.unwrap_or_default()),
                    "actor": decided_by.unwrap_or_else(|| "unknown".to_string()),
                }));
            }
        }
    }
    
    // Get BDA assessments for this target
    if let Ok(bdas) = sqlx::query(
        "SELECT id, physical_damage, functional_damage, recommendation, created_at 
         FROM bda_reports 
         WHERE target_id = ? 
         ORDER BY created_at DESC"
    )
    .bind(&id)
    .fetch_all(&pool)
    .await {
        for row in bdas {
            let created_at: String = row.get("created_at");
            let physical: String = row.get("physical_damage");
            let functional: String = row.get("functional_damage");
            timeline.push(serde_json::json!({
                "timestamp": created_at,
                "type": "BDA_ASSESSMENT",
                "description": format!("BDA: {} physical, {} functional", physical, functional),
                "actor": "system",
            }));
        }
    }
    
    // Get decision log entries mentioning this target
    if let Ok(decisions) = sqlx::query(
        "SELECT id, decision_text, decision_maker, decision_time 
         FROM decision_log 
         WHERE decision_text LIKE ? 
         ORDER BY decision_time DESC"
    )
    .bind(format!("%{}%", id))
    .fetch_all(&pool)
    .await {
        for row in decisions {
            let decision_time: Option<String> = row.get("decision_time");
            let decision_text: String = row.get("decision_text");
            let decision_maker: String = row.get("decision_maker");
            
            if let Some(time) = decision_time {
                timeline.push(serde_json::json!({
                    "timestamp": time,
                    "type": "DECISION_LOG",
                    "description": decision_text,
                    "actor": decision_maker,
                }));
            }
        }
    }
    
    // Sort timeline by timestamp (most recent first)
    timeline.sort_by(|a, b| {
        let time_a = a.get("timestamp").and_then(|v| v.as_str()).unwrap_or("");
        let time_b = b.get("timestamp").and_then(|v| v.as_str()).unwrap_or("");
        time_b.cmp(time_a) // Reverse order (newest first)
    });
    
    Ok(Json(serde_json::json!({
        "target_id": id,
        "timeline": timeline,
        "total_events": timeline.len()
    })))
}

#[derive(Debug, Deserialize)]
pub struct AdvanceStageRequest {
    pub new_stage: String,
}

pub async fn advance_f3ead_stage(
    State(pool): State<Pool<Sqlite>>,
    Path(id): Path<String>,
    Json(req): Json<AdvanceStageRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    use crate::features::targeting::services::validate_f3ead_transition;
    
    // Get current target to check current stage
    let target = TargetRepository::get_by_id(&pool, &id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;
    
    // Get current F3EAD stage from target (defaults to "FIND" if not set)
    let current_stage = target.f3ead_stage.as_deref().unwrap_or("FIND");
    
    // Validate transition
    validate_f3ead_transition(current_stage, &req.new_stage)
        .map_err(|e| {
            eprintln!("F3EAD transition validation failed: {}", e);
            StatusCode::BAD_REQUEST
        })?;
    
    // Update target's F3EAD stage
    TargetRepository::update_f3ead_stage(&pool, &id, &req.new_stage)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok((StatusCode::OK, Json(serde_json::json!({
        "message": "F3EAD stage advanced",
        "target_id": id,
        "new_stage": req.new_stage
    }))))
}

pub async fn get_targeting_summary(
    State(pool): State<Pool<Sqlite>>,
) -> Result<impl IntoResponse, StatusCode> {
    let summary = TargetRepository::get_summary(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(summary))
}

// ============================================================================
// DTL HANDLERS
// ============================================================================

pub async fn list_dtl(
    State(pool): State<Pool<Sqlite>>,
    Query(params): Query<TargetQueryParams>,
) -> Result<impl IntoResponse, StatusCode> {
    let entries = DtlRepository::list_all(&pool, params.limit)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(entries))
}

pub async fn create_dtl_entry(
    State(pool): State<Pool<Sqlite>>,
    Json(req): Json<CreateDtlEntryRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let id = DtlRepository::create(&pool, &req.target_id, req.priority_score, req.feasibility_score)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

#[derive(Debug, Deserialize)]
pub struct UpdatePriorityRequest {
    pub priority_score: f64,
    pub feasibility_score: f64,
}

pub async fn update_dtl_priority(
    State(pool): State<Pool<Sqlite>>,
    Path(id): Path<String>,
    Json(req): Json<UpdatePriorityRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    use crate::features::targeting::services::DtlScoring;
    
    // Validate scores are in range [0.0, 1.0]
    if req.priority_score < 0.0 || req.priority_score > 1.0 {
        return Err(StatusCode::BAD_REQUEST);
    }
    if req.feasibility_score < 0.0 || req.feasibility_score > 1.0 {
        return Err(StatusCode::BAD_REQUEST);
    }
    
    // Calculate new combined score using business logic
    let combined_score = DtlScoring::calculate_combined_score(
        req.priority_score,
        req.feasibility_score
    );
    
    // Update DTL entry with new scores
    sqlx::query(
        "UPDATE dtl_entries 
         SET priority_score = ?, feasibility_score = ?, combined_score = ?, updated_at = datetime('now')
         WHERE id = ?"
    )
    .bind(req.priority_score)
    .bind(req.feasibility_score)
    .bind(combined_score)
    .bind(&id)
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(StatusCode::OK)
}

pub async fn get_active_tsts(
    State(pool): State<Pool<Sqlite>>,
) -> Result<impl IntoResponse, StatusCode> {
    let tsts = DtlRepository::get_active_tsts(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(tsts))
}

// ============================================================================
// BDA HANDLERS (uses existing bda_reports table)
// ============================================================================

pub async fn list_bda(
    State(_pool): State<Pool<Sqlite>>,
) -> Result<impl IntoResponse, StatusCode> {
    Ok(Json(Vec::<BdaAssessment>::new()))
}

pub async fn create_bda(
    State(_pool): State<Pool<Sqlite>>,
    Json(_req): Json<CreateBdaRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    Ok((StatusCode::CREATED, Json(serde_json::json!({"message": "Use existing BDA system"}))))
}

pub async fn get_bda(
    State(pool): State<Pool<Sqlite>>,
    Path(id): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let bda = BdaRepository::get_by_id(&pool, &id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    match bda {
        Some(b) => Ok(Json(b)),
        None => Err(StatusCode::NOT_FOUND)
    }
}

pub async fn get_reattack_recommendations(
    State(_pool): State<Pool<Sqlite>>,
) -> Result<impl IntoResponse, StatusCode> {
    Ok(Json(Vec::<BdaAssessment>::new()))
}

// ============================================================================
// ISR HANDLERS
// ============================================================================

pub async fn list_isr_platforms(
    State(pool): State<Pool<Sqlite>>,
    Query(params): Query<PlatformQueryParams>,
) -> Result<impl IntoResponse, StatusCode> {
    let platforms = IsrRepository::list_all(&pool, params.status.as_deref())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(platforms))
}

pub async fn create_isr_platform(
    State(pool): State<Pool<Sqlite>>,
    Json(req): Json<CreateIsrPlatformRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let platform = IsrPlatform {
        id: String::new(),
        platform_type: req.platform_type,
        platform_name: req.platform_name,
        callsign: req.callsign,
        current_position: None,
        sensor_type: req.sensor_type,
        sensor_range_km: None,
        coverage_area: None,
        status: "STANDBY".to_string(),
        loiter_time_remaining: None,
        fuel_remaining_percent: None,
        current_task: None,
        tasking_priority: None,
        tasked_targets: None,
        classification: req.classification,
        created_at: String::new(),
        updated_at: String::new(),
    };
    
    let id = IsrRepository::create(&pool, &platform)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

pub async fn get_isr_coverage(
    State(pool): State<Pool<Sqlite>>,
) -> Result<impl IntoResponse, StatusCode> {
    // Get active ISR platforms and their coverage areas
    // For now, return basic coverage summary (full spatial analysis requires geographic library)
    
    let platforms = IsrRepository::list_all(&pool, Some("ACTIVE"))
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let active_count = platforms.iter().filter(|p| p.status == "ACTIVE").count();
    let total_count = platforms.len();
    
    let mut coverage_summary = Vec::new();
    
    for platform in &platforms {
        // Basic coverage info (full spatial analysis would require PostGIS or similar)
        let coverage = serde_json::json!({
            "platform_id": platform.id,
            "platform_name": platform.platform_name,
            "platform_type": platform.platform_type,
            "sensor_type": platform.sensor_type,
            "sensor_range_km": platform.sensor_range_km,
            "status": platform.status,
            "current_position": platform.current_position,
            "coverage_area": platform.coverage_area, // JSON polygon if available
            "loiter_time_remaining": platform.loiter_time_remaining,
            "fuel_remaining_percent": platform.fuel_remaining_percent,
            "current_task": platform.current_task,
        });
        coverage_summary.push(coverage);
    }
    
    Ok(Json(serde_json::json!({
        "total_platforms": total_count,
        "active_platforms": active_count,
        "platforms": coverage_summary,
        "note": "Full spatial coverage analysis requires geographic calculations. Use coverage_area JSON for polygon data."
    })))
}

pub async fn get_pattern_of_life(
    State(pool): State<Pool<Sqlite>>,
) -> Result<impl IntoResponse, StatusCode> {
    let reports = IsrRepository::get_pattern_of_life(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(reports))
}

// ============================================================================
// INTELLIGENCE HANDLERS
// ============================================================================

pub async fn list_intel_reports(
    State(_pool): State<Pool<Sqlite>>,
) -> Result<impl IntoResponse, StatusCode> {
    Ok(Json(Vec::<IntelligenceReport>::new()))
}

pub async fn create_intel_report(
    State(pool): State<Pool<Sqlite>>,
    Extension(claims): Extension<Claims>,
    Json(req): Json<CreateIntelReportRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = &claims.sub;
    let report = IntelligenceReport {
        id: String::new(),
        target_id: req.target_id,
        int_type: req.int_type,
        report_title: req.report_title,
        report_content: req.report_content,
        report_summary: None,
        confidence_level: req.confidence_level,
        source_reliability: req.source_reliability,
        collection_time: req.collection_time,
        reporting_time: String::new(),
        fusion_score: None,
        pattern_of_life_indicator: false,
        classification: req.classification,
        collected_by: Some(user_id.to_string()),
        created_at: String::new(),
        updated_at: String::new(),
    };
    
    let id = IntelRepository::create(&pool, &report, user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

pub async fn get_intel_fusion(
    State(pool): State<Pool<Sqlite>>,
    Path(target_id): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let reports = IntelRepository::get_by_target_id(&pool, &target_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(reports))
}

// ============================================================================
// STRIKE ASSET HANDLERS
// ============================================================================

pub async fn list_strike_platforms(
    State(pool): State<Pool<Sqlite>>,
    Query(params): Query<PlatformQueryParams>,
) -> Result<impl IntoResponse, StatusCode> {
    let platforms = StrikePlatformRepository::list_all(&pool, params.status.as_deref())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(platforms))
}

pub async fn create_strike_platform(
    State(pool): State<Pool<Sqlite>>,
    Json(req): Json<CreateStrikePlatformRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let platform = StrikePlatform {
        id: String::new(),
        platform_type: req.platform_type,
        platform_name: req.platform_name,
        callsign: None,
        unit: None,
        munitions_available: None,
        sorties_available: req.sorties_available,
        platform_status: "READY".to_string(),
        classification: req.classification,
        created_at: String::new(),
        updated_at: String::new(),
    };
    
    let id = StrikePlatformRepository::create(&pool, &platform)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

pub async fn get_munitions_inventory(
    State(pool): State<Pool<Sqlite>>,
) -> Result<impl IntoResponse, StatusCode> {
    // Query munitions table
    let rows = sqlx::query(
        "SELECT id, munition_type, munition_category, platform_type, 
                total_count, available_count, allocated_count, expended_count,
                range_km, yield_kg, guidance_type, warhead_type,
                suitable_target_types, cde_estimate_range, classification
         FROM munitions
         ORDER BY available_count DESC, munition_type"
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let mut inventory = Vec::new();
    
    for row in rows {
        let suitable_types_json: Option<String> = row.get("suitable_target_types");
        let cde_range_json: Option<String> = row.get("cde_estimate_range");
        
        let suitable_types: Vec<String> = suitable_types_json
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_default();
        
        let cde_range: serde_json::Value = cde_range_json
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_else(|| serde_json::json!({"min": 0, "max": 0}));
        
        inventory.push(serde_json::json!({
            "id": row.get::<String, _>("id"),
            "munitionType": row.get::<String, _>("munition_type"),
            "category": row.get::<String, _>("munition_category"),
            "platformType": row.get::<Option<String>, _>("platform_type"),
            "totalCount": row.get::<i32, _>("total_count"),
            "availableCount": row.get::<i32, _>("available_count"),
            "allocatedCount": row.get::<i32, _>("allocated_count"),
            "expendedCount": row.get::<i32, _>("expended_count"),
            "rangeKm": row.get::<Option<f64>, _>("range_km"),
            "yieldKg": row.get::<Option<f64>, _>("yield_kg"),
            "guidanceType": row.get::<Option<String>, _>("guidance_type"),
            "warheadType": row.get::<Option<String>, _>("warhead_type"),
            "suitableTargetTypes": suitable_types,
            "cdeEstimateRange": cde_range,
            "classification": row.get::<String, _>("classification"),
        }));
    }
    
    Ok(Json(serde_json::json!({
        "inventory": inventory,
        "total_types": inventory.len(),
        "total_available": inventory.iter()
            .map(|m| m.get("availableCount").and_then(|v| v.as_i64()).unwrap_or(0))
            .sum::<i64>()
    })))
}

#[derive(Debug, Deserialize)]
pub struct MunitionsPairingRequest {
    pub target_id: String,
    pub desired_effects: Vec<String>,
}

pub async fn get_munitions_pairing(
    State(pool): State<Pool<Sqlite>>,
    Json(req): Json<MunitionsPairingRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    // Get target information
    let target = TargetRepository::get_by_id(&pool, &req.target_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;
    
    // Get available munitions
    let munitions_rows = sqlx::query(
        "SELECT id, munition_type, munition_category, platform_type, available_count,
                range_km, yield_kg, guidance_type, warhead_type,
                suitable_target_types, cde_estimate_range
         FROM munitions
         WHERE available_count > 0
         ORDER BY available_count DESC"
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let mut recommendations = Vec::new();
    
    for row in munitions_rows {
        let suitable_types_json: Option<String> = row.get("suitable_target_types");
        let suitable_types: Vec<String> = suitable_types_json
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_default();
        
        // Simple matching algorithm:
        // 1. Check if target type matches suitable target types
        // 2. Check if desired effects can be achieved
        // 3. Score based on availability and suitability
        
        let target_type_match = suitable_types.iter()
            .any(|t| target.target_type.to_uppercase().contains(&t.to_uppercase()));
        
        let score: f64 = if target_type_match {
            // Base score for type match
            let mut score: f64 = 0.7;
            
            // Boost score if available count is high
            let available: i32 = row.get("available_count");
            if available > 10 {
                score += 0.2;
            }
            
            // Boost if range is sufficient (placeholder - would need target distance)
            if let Some(range) = row.get::<Option<f64>, _>("range_km") {
                if range > 20.0 {
                    score += 0.1;
                }
            }
            
            score.min(1.0)
        } else {
            0.3 // Lower score if type doesn't match but still available
        };
        
        if score > 0.5 { // Only recommend if score > 50%
            let cde_range_json: Option<String> = row.get("cde_estimate_range");
            let cde_range: serde_json::Value = cde_range_json
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_else(|| serde_json::json!({"min": 0, "max": 0}));
            
            recommendations.push(serde_json::json!({
                "munitionId": row.get::<String, _>("id"),
                "munitionType": row.get::<String, _>("munition_type"),
                "category": row.get::<String, _>("munition_category"),
                "platformType": row.get::<Option<String>, _>("platform_type"),
                "availableCount": row.get::<i32, _>("available_count"),
                "rangeKm": row.get::<Option<f64>, _>("range_km"),
                "yieldKg": row.get::<Option<f64>, _>("yield_kg"),
                "guidanceType": row.get::<Option<String>, _>("guidance_type"),
                "suitabilityScore": score,
                "matchReason": if target_type_match { "Target type matches munition suitability" } else { "Available but not ideal match" },
                "cdeEstimateRange": cde_range,
            }));
        }
    }
    
    // Sort by suitability score (highest first)
    recommendations.sort_by(|a, b| {
        let score_a = a.get("suitabilityScore").and_then(|v| v.as_f64()).unwrap_or(0.0);
        let score_b = b.get("suitabilityScore").and_then(|v| v.as_f64()).unwrap_or(0.0);
        score_b.partial_cmp(&score_a).unwrap_or(std::cmp::Ordering::Equal)
    });
    
    Ok(Json(serde_json::json!({
        "target_id": req.target_id,
        "target_type": target.target_type,
        "desired_effects": req.desired_effects,
        "recommendations": recommendations,
        "total_recommendations": recommendations.len()
    })))
}

// ============================================================================
// RISK HANDLERS
// ============================================================================

pub async fn get_risk_assessment(
    State(pool): State<Pool<Sqlite>>,
    Path(target_id): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let assessment = RiskRepository::get_by_target_id(&pool, &target_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;
    Ok(Json(assessment))
}

pub async fn create_risk_assessment(
    State(pool): State<Pool<Sqlite>>,
    Extension(claims): Extension<Claims>,
    Json(req): Json<CreateRiskAssessmentRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = &claims.sub;
    let id = RiskRepository::create(
        &pool,
        &req.target_id,
        &req.fratricide_risk,
        &req.political_sensitivity,
        &req.legal_review_status,
        &req.classification,
        user_id
    )
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

pub async fn get_high_risk_targets(
    State(pool): State<Pool<Sqlite>>,
) -> Result<impl IntoResponse, StatusCode> {
    let high_risk = RiskRepository::get_high_risk(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(high_risk))
}

// ============================================================================
// ALTERNATIVE ANALYSIS HANDLERS
// ============================================================================

pub async fn list_assumptions(
    State(pool): State<Pool<Sqlite>>,
    Query(params): Query<PlatformQueryParams>,
) -> Result<impl IntoResponse, StatusCode> {
    let assumptions = AssumptionChallengeRepository::list_all(&pool, params.status.as_deref())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(assumptions))
}

pub async fn create_assumption_challenge(
    State(pool): State<Pool<Sqlite>>,
    Json(req): Json<CreateAssumptionChallengeRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let id = AssumptionChallengeRepository::create(&pool, &req.assumption_text, req.confidence_level, &req.validation_status)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

pub async fn get_bias_alerts(
    State(_pool): State<Pool<Sqlite>>,
) -> Result<impl IntoResponse, StatusCode> {
    Ok(Json(Vec::<String>::new()))
}

// ============================================================================
// COLLABORATION HANDLERS
// ============================================================================

pub async fn list_decisions(
    State(pool): State<Pool<Sqlite>>,
    Query(params): Query<TargetQueryParams>,
) -> Result<impl IntoResponse, StatusCode> {
    let decisions = DecisionLogRepository::list_recent(&pool, params.limit)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(decisions))
}

pub async fn create_decision(
    State(pool): State<Pool<Sqlite>>,
    Extension(claims): Extension<Claims>,
    Json(req): Json<CreateDecisionLogRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = &claims.sub;
    let id = DecisionLogRepository::create(
        &pool,
        &req.decision_type,
        &req.decision_text,
        &req.decision_rationale,
        &req.decision_maker_role,
        &req.authority_level,
        &req.classification,
        user_id
    )
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

pub async fn list_handovers(
    State(pool): State<Pool<Sqlite>>,
    Query(params): Query<TargetQueryParams>,
) -> Result<impl IntoResponse, StatusCode> {
    let handovers = ShiftHandoverRepository::get_recent(&pool, params.limit)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(handovers))
}

pub async fn generate_handover(
    State(pool): State<Pool<Sqlite>>,
    Extension(claims): Extension<Claims>,
    Json(req): Json<CreateShiftHandoverRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = &claims.sub;
    let summary = TargetRepository::get_summary(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let id = ShiftHandoverRepository::create(
        &pool,
        &req.shift_date,
        &req.shift_type,
        &req.incoming_watch_officer,
        &format!("{} active targets", summary.active_targets),
        &format!("{} pending nominations", summary.pending_nominations),
        &req.classification,
        user_id
    )
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

pub async fn get_target_annotations(
    State(pool): State<Pool<Sqlite>>,
    Path(target_id): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let annotations = AnnotationRepository::get_by_target_id(&pool, &target_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(annotations))
}

pub async fn create_annotation(
    State(pool): State<Pool<Sqlite>>,
    Extension(claims): Extension<Claims>,
    Json(req): Json<CreateAnnotationRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = &claims.sub;
    let id = AnnotationRepository::create(
        &pool,
        req.target_id.as_deref(),
        &req.annotation_text,
        &req.annotation_type,
        req.is_critical,
        &req.classification,
        user_id
    )
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

// ============================================================================
// JTB (JOINT TARGETING BOARD) HANDLERS
// ============================================================================

pub async fn list_jtb_sessions(
    State(pool): State<Pool<Sqlite>>,
    Query(params): Query<PlatformQueryParams>,
) -> Result<impl IntoResponse, StatusCode> {
    let sessions = JtbRepository::list_sessions(&pool, params.status.as_deref(), None)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(sessions))
}

pub async fn create_jtb_session(
    State(pool): State<Pool<Sqlite>>,
    Extension(claims): Extension<Claims>,
    Json(req): Json<CreateJtbSessionRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = &claims.sub;
    
    let required_attendees_json = req.required_attendees
        .as_ref()
        .map(|v| serde_json::to_string(v).unwrap_or_default());
    
    let caveats_json = req.caveats
        .as_ref()
        .map(|v| serde_json::to_string(v).unwrap_or_default());
    
    let id = JtbRepository::create_session(
        &pool,
        &req.session_name,
        &req.session_date,
        &req.session_time,
        &req.session_datetime,
        &req.chair,
        req.chair_rank.as_deref(),
        required_attendees_json.as_deref(),
        &req.classification,
        caveats_json.as_deref(),
        user_id,
    )
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

pub async fn get_jtb_session(
    State(pool): State<Pool<Sqlite>>,
    Path(session_id): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let session = JtbRepository::get_session_by_id(&pool, &session_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;
    
    let targets = JtbRepository::get_targets_for_session(&pool, &session_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(serde_json::json!({
        "session": session,
        "targets": targets
    })))
}

pub async fn add_target_to_jtb_session(
    State(pool): State<Pool<Sqlite>>,
    Path(session_id): Path<String>,
    Json(req): Json<AddTargetToSessionRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    // Get current max presentation order for this session
    let existing_targets = JtbRepository::get_targets_for_session(&pool, &session_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let presentation_order = req.presentation_order.unwrap_or_else(|| {
        (existing_targets.len() + 1) as i32
    });
    
    let id = JtbRepository::add_target_to_session(
        &pool,
        &session_id,
        &req.target_id,
        presentation_order,
    )
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

pub async fn record_jtb_decision(
    State(pool): State<Pool<Sqlite>>,
    Path(jtb_target_id): Path<String>,
    Json(req): Json<RecordJtbDecisionRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    JtbRepository::record_decision(
        &pool,
        &jtb_target_id,
        &req.decision,
        &req.decision_rationale,
        &req.decided_by,
        req.votes_for,
        req.votes_against,
        req.votes_abstain,
        req.approval_conditions.as_deref(),
        req.mitigation_requirements.as_deref(),
    )
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(StatusCode::OK)
}

pub async fn update_jtb_session_status(
    State(pool): State<Pool<Sqlite>>,
    Path(session_id): Path<String>,
    Json(req): Json<serde_json::Value>,
) -> Result<impl IntoResponse, StatusCode> {
    let status = req.get("status")
        .and_then(|v| v.as_str())
        .ok_or(StatusCode::BAD_REQUEST)?;
    
    JtbRepository::update_session_status(&pool, &session_id, status)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(StatusCode::OK)
}

// ============================================================================
// DECISION GATES - Dashboard operational status
// ============================================================================

/// Get current decision gates status (ROE, CDE, Weather, Deconfliction)
/// Used by DecisionGatesBar component on targeting cell dashboard
pub async fn get_decision_gates(
    State(pool): State<Pool<Sqlite>>,
) -> Result<impl IntoResponse, StatusCode> {
    // Fetch ROE status
    let roe = get_roe_gate(&pool).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Fetch CDE status
    let cde = get_cde_gate(&pool).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Fetch Weather status
    let weather = get_weather_gate(&pool).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Fetch Deconfliction status
    let deconfliction = get_deconfliction_gate(&pool).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let response = DecisionGatesResponse {
        roe,
        cde,
        weather,
        deconfliction,
    };
    
    Ok(Json(response))
}

// Helper functions to fetch individual gate statuses

async fn get_roe_gate(pool: &Pool<Sqlite>) -> Result<DecisionGate, sqlx::Error> {
    let row = sqlx::query(
        r#"
        SELECT status, caveats, classification, updated_at
        FROM roe_status
        WHERE is_current = 1
        ORDER BY updated_at DESC
        LIMIT 1
        "#
    )
    .fetch_optional(pool)
    .await?;
    
    match row {
        Some(row) => {
            let status_text: String = row.get("status");
            let caveats_json: Option<String> = row.get("caveats");
            let classification: String = row.get("classification");
            
            let caveats = caveats_json
                .and_then(|s| serde_json::from_str::<Vec<String>>(&s).ok());
            
            let status = match status_text.as_str() {
                "WEAPON_FREE" => GateStatus::Green,
                "WEAPON_TIGHT" => GateStatus::Yellow,
                _ => GateStatus::Red,
            };
            
            Ok(DecisionGate {
                name: "ROE".to_string(),
                status,
                value: status_text,
                classification: map_classification(&classification),
                caveats,
                details: Some("Rules of Engagement".to_string()),
            })
        }
        None => Ok(DecisionGate {
            name: "ROE".to_string(),
            status: GateStatus::Yellow,
            value: "PENDING".to_string(),
            classification: ClassificationLevel::Secret,
            caveats: Some(vec!["NOFORN".to_string()]),
            details: Some("No ROE data available".to_string()),
        }),
    }
}

async fn get_cde_gate(pool: &Pool<Sqlite>) -> Result<DecisionGate, sqlx::Error> {
    // Count pending CDE assessments
    let pending_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM cde_status WHERE status = 'PENDING'"
    )
    .fetch_one(pool)
    .await
    .unwrap_or(0);
    
    // Get CDE limit from most recent record
    let row = sqlx::query(
        "SELECT cde_limit, classification FROM cde_status ORDER BY updated_at DESC LIMIT 1"
    )
    .fetch_optional(pool)
    .await?;
    
    match row {
        Some(row) => {
            let limit: i32 = row.get("cde_limit");
            let classification: String = row.get("classification");
            
            let status = if pending_count == 0 {
                GateStatus::Green
            } else if pending_count < limit as i64 {
                GateStatus::Yellow
            } else {
                GateStatus::Red
            };
            
            Ok(DecisionGate {
                name: "CDE".to_string(),
                status,
                value: format!("{}/{}", pending_count, limit),
                classification: map_classification(&classification),
                caveats: None,
                details: Some("Collateral Damage Estimate".to_string()),
            })
        }
        None => Ok(DecisionGate {
            name: "CDE".to_string(),
            status: GateStatus::Green,
            value: "0/50".to_string(),
            classification: ClassificationLevel::Secret,
            caveats: None,
            details: Some("No CDE data available".to_string()),
        }),
    }
}

async fn get_weather_gate(pool: &Pool<Sqlite>) -> Result<DecisionGate, sqlx::Error> {
    let row = sqlx::query(
        r#"
        SELECT status, current_conditions, visibility_km, classification
        FROM weather_status
        WHERE is_current = 1
        ORDER BY last_updated DESC
        LIMIT 1
        "#
    )
    .fetch_optional(pool)
    .await?;
    
    match row {
        Some(row) => {
            let status_text: String = row.get("status");
            let conditions: Option<String> = row.get("current_conditions");
            let visibility: Option<f64> = row.get("visibility_km");
            let classification: String = row.get("classification");
            
            let status = match status_text.as_str() {
                "GREEN" => GateStatus::Green,
                "YELLOW" => GateStatus::Yellow,
                _ => GateStatus::Red,
            };
            
            let value = if let (Some(cond), Some(vis)) = (conditions, visibility) {
                format!("{} ({}km)", cond, vis)
            } else {
                status_text.clone()
            };
            
            Ok(DecisionGate {
                name: "Weather".to_string(),
                status,
                value,
                classification: map_classification(&classification),
                caveats: None,
                details: Some("Environmental conditions".to_string()),
            })
        }
        None => Ok(DecisionGate {
            name: "Weather".to_string(),
            status: GateStatus::Green,
            value: "CLEAR".to_string(),
            classification: ClassificationLevel::Unclass,
            caveats: None,
            details: Some("No weather data available".to_string()),
        }),
    }
}

async fn get_deconfliction_gate(pool: &Pool<Sqlite>) -> Result<DecisionGate, sqlx::Error> {
    let row = sqlx::query(
        r#"
        SELECT status, pending_deconflictions, classification
        FROM deconfliction_status
        WHERE is_current = 1
        ORDER BY last_updated DESC
        LIMIT 1
        "#
    )
    .fetch_optional(pool)
    .await?;
    
    match row {
        Some(row) => {
            let deconf_status: String = row.get("status");
            let pending: i32 = row.get("pending_deconflictions");
            let classification: String = row.get("classification");
            
            let status = match deconf_status.as_str() {
                "GREEN" => GateStatus::Green,
                "YELLOW" => GateStatus::Yellow,
                "RED" => GateStatus::Red,
                _ => if pending == 0 { GateStatus::Green } else { GateStatus::Yellow },
            };
            
            Ok(DecisionGate {
                name: "Deconfliction".to_string(),
                status,
                value: format!("{} ({} pending)", deconf_status, pending),
                classification: map_classification(&classification),
                caveats: None,
                details: Some("Airspace coordination".to_string()),
            })
        }
        None => Ok(DecisionGate {
            name: "Deconfliction".to_string(),
            status: GateStatus::Green,
            value: "CLEAR (0 pending)".to_string(),
            classification: ClassificationLevel::Cui,
            caveats: None,
            details: Some("No deconfliction data available".to_string()),
        }),
    }
}

fn map_classification(s: &str) -> ClassificationLevel {
    match s.to_uppercase().as_str() {
        "UNCLASS" => ClassificationLevel::Unclass,
        "CUI" => ClassificationLevel::Cui,
        "SECRET" => ClassificationLevel::Secret,
        "TOP_SECRET" | "TOP SECRET" => ClassificationLevel::TopSecret,
        "TS_SCI" | "TS/SCI" => ClassificationLevel::TsSci,
        _ => ClassificationLevel::Secret,
    }
}

// ============================================================================
// MISSION COMMAND - Dashboard support for MissionCommandOverview component
// ============================================================================

/// Get commander's intent (phase, priority effects, endstate, metrics)
/// Used by MissionCommandOverview component
pub async fn get_mission_intent(
    State(pool): State<Pool<Sqlite>>,
) -> Result<impl IntoResponse, StatusCode> {
    let row = sqlx::query(
        "SELECT phase, priority_effects, endstate, endstate_metrics 
         FROM mission_intent 
         WHERE is_current = 1 
         ORDER BY updated_at DESC 
         LIMIT 1"
    )
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    match row {
        Some(row) => {
            let phase: String = row.get("phase");
            let priority_effects_json: String = row.get("priority_effects");
            let endstate: String = row.get("endstate");
            let endstate_metrics_json: String = row.get("endstate_metrics");
            
            let priority_effects: Vec<String> = serde_json::from_str(&priority_effects_json)
                .unwrap_or_else(|_| vec![]);
            let endstate_metrics: serde_json::Value = serde_json::from_str(&endstate_metrics_json)
                .unwrap_or_else(|_| serde_json::json!([]));
            
            Ok(Json(serde_json::json!({
                "phase": phase,
                "priorityEffects": priority_effects,
                "endstate": endstate,
                "endstateMetrics": endstate_metrics
            })))
        }
        None => {
            // Fallback to default if no record exists
            Ok(Json(serde_json::json!({
                "phase": "Phase 2: Hostile Force Degradation",
                "priorityEffects": [
                    "Disrupt enemy C2 networks",
                    "Attrit enemy armor by 30%",
                    "Deny enemy freedom of movement in AO-North"
                ],
                "endstate": "Enemy unable to conduct coordinated operations in AO-North",
                "endstateMetrics": [
                    { "name": "Enemy C2 Nodes Destroyed", "current": 12, "target": 18, "status": "at-risk" },
                    { "name": "Armor Attrition %", "current": 22, "target": 30, "status": "at-risk" },
                    { "name": "Movement Denial Coverage %", "current": 87, "target": 90, "status": "on-track" }
                ]
            })))
        }
    }
}

/// Update commander's intent
pub async fn update_mission_intent(
    State(pool): State<Pool<Sqlite>>,
    Extension(claims): Extension<Claims>,
    Json(req): Json<serde_json::Value>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = &claims.sub;
    
    // Extract fields from request
    let phase = req.get("phase").and_then(|v| v.as_str()).unwrap_or("");
    let priority_effects = req.get("priorityEffects")
        .and_then(|v| serde_json::to_string(v).ok())
        .unwrap_or_else(|| "[]".to_string());
    let endstate = req.get("endstate").and_then(|v| v.as_str()).unwrap_or("");
    let endstate_metrics = req.get("endstateMetrics")
        .and_then(|v| serde_json::to_string(v).ok())
        .unwrap_or_else(|| "[]".to_string());
    
    // Mark existing current intent as not current
    sqlx::query("UPDATE mission_intent SET is_current = 0 WHERE is_current = 1")
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Insert new intent as current
    sqlx::query(
        "INSERT INTO mission_intent (phase, priority_effects, endstate, endstate_metrics, created_by, is_current)
         VALUES (?, ?, ?, ?, ?, 1)"
    )
    .bind(phase)
    .bind(&priority_effects)
    .bind(endstate)
    .bind(&endstate_metrics)
    .bind(user_id)
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok((StatusCode::OK, Json(serde_json::json!({"message": "Intent updated"}))))
}

/// Get targeting guidance (ROE level, collateral threshold, approved target sets, restrictions)
pub async fn get_targeting_guidance(
    State(pool): State<Pool<Sqlite>>,
) -> Result<impl IntoResponse, StatusCode> {
    let row = sqlx::query(
        "SELECT roe_level, collateral_threshold, approved_target_sets, restrictions 
         FROM targeting_guidance 
         WHERE is_current = 1 
         ORDER BY updated_at DESC 
         LIMIT 1"
    )
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    match row {
        Some(row) => {
            let roe_level: String = row.get("roe_level");
            let collateral_threshold: String = row.get("collateral_threshold");
            let approved_target_sets_json: String = row.get("approved_target_sets");
            let restrictions_json: String = row.get("restrictions");
            
            let approved_target_sets: Vec<String> = serde_json::from_str(&approved_target_sets_json)
                .unwrap_or_else(|_| vec![]);
            let restrictions: Vec<String> = serde_json::from_str(&restrictions_json)
                .unwrap_or_else(|_| vec![]);
            
            Ok(Json(serde_json::json!({
                "roeLevel": roe_level,
                "collateralThreshold": collateral_threshold,
                "approvedTargetSets": approved_target_sets,
                "restrictions": restrictions
            })))
        }
        None => {
            // Fallback: Get ROE level from roe_status table
            let roe_level = sqlx::query("SELECT status FROM roe_status WHERE is_current = 1 ORDER BY updated_at DESC LIMIT 1")
                .fetch_optional(&pool)
                .await
                .ok()
                .flatten()
                .map(|row| row.get::<String, _>("status"))
                .unwrap_or_else(|| "WEAPON_FREE".to_string());
            
            Ok(Json(serde_json::json!({
                "roeLevel": roe_level,
                "collateralThreshold": "CDE < 50 civilian casualties per strike",
                "approvedTargetSets": [
                    "Category 1: C2 Nodes (High Priority)",
                    "Category 2: Armor Formations (Medium Priority)",
                    "Category 3: Logistics Hubs (Low Priority)"
                ],
                "restrictions": [
                    "NO STRIKE: Cultural/religious sites",
                    "NO STRIKE: Medical facilities",
                    "RESTRICTED: Dual-use infrastructure (Commander approval required)"
                ]
            })))
        }
    }
}

/// Get decision authority matrix (level, authority, can approve, must escalate)
pub async fn get_authority_matrix(
    State(pool): State<Pool<Sqlite>>,
) -> Result<impl IntoResponse, StatusCode> {
    let row = sqlx::query(
        "SELECT level, authority, can_approve, must_escalate 
         FROM decision_authority 
         WHERE is_current = 1 
         ORDER BY updated_at DESC 
         LIMIT 1"
    )
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    match row {
        Some(row) => {
            let level: String = row.get("level");
            let authority: String = row.get("authority");
            let can_approve_json: String = row.get("can_approve");
            let must_escalate_json: String = row.get("must_escalate");
            
            let can_approve: Vec<String> = serde_json::from_str(&can_approve_json)
                .unwrap_or_else(|_| vec![]);
            let must_escalate: Vec<String> = serde_json::from_str(&must_escalate_json)
                .unwrap_or_else(|_| vec![]);
            
            Ok(Json(serde_json::json!({
                "level": level,
                "authority": authority,
                "canApprove": can_approve,
                "mustEscalate": must_escalate
            })))
        }
        None => {
            // Fallback to default
            Ok(Json(serde_json::json!({
                "level": "OPERATIONAL",
                "authority": "Commander, Joint Task Force",
                "canApprove": [
                    "Category 1-2 targets (CDE < 50)",
                    "Time-sensitive targets (CDE < 20)",
                    "ROE modifications within authority"
                ],
                "mustEscalate": [
                    "Category 1-2 targets (CDE ≥ 50)",
                    "All Category 3 targets",
                    "Strategic targets",
                    "Cross-border strikes"
                ]
            })))
        }
    }
}

/// Get operational tempo (current phase, hours into phase, critical decision points)
pub async fn get_operational_tempo(
    State(pool): State<Pool<Sqlite>>,
) -> Result<impl IntoResponse, StatusCode> {
    let row = sqlx::query(
        "SELECT current_phase, hours_into_phase, critical_decision_points 
         FROM operational_tempo 
         WHERE is_current = 1 
         ORDER BY updated_at DESC 
         LIMIT 1"
    )
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    match row {
        Some(row) => {
            let current_phase: String = row.get("current_phase");
            let hours_into_phase: i32 = row.get("hours_into_phase");
            let critical_decision_points_json: String = row.get("critical_decision_points");
            
            let critical_decision_points: serde_json::Value = serde_json::from_str(&critical_decision_points_json)
                .unwrap_or_else(|_| serde_json::json!([]));
            
            Ok(Json(serde_json::json!({
                "currentPhase": current_phase,
                "hoursIntoPhase": hours_into_phase,
                "criticalDecisionPoints": critical_decision_points
            })))
        }
        None => {
            // Fallback to default
            Ok(Json(serde_json::json!({
                "currentPhase": "Day 12 of 21 - Phase 2",
                "hoursIntoPhase": 276,
                "criticalDecisionPoints": [
                    { "name": "JTB Session", "time": "14:00Z", "status": "upcoming" },
                    { "name": "Strike Window Opens", "time": "16:00Z", "status": "upcoming" },
                    { "name": "BDA Review", "time": "20:00Z", "status": "upcoming" },
                    { "name": "Phase 3 Transition Decision", "time": "D+15", "status": "upcoming" }
                ]
            })))
        }
    }
}
