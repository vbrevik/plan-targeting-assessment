// Integration tests for targeting handlers
// Tests API endpoints with database interactions

use template_repo_backend::features::targeting::services::*;

#[tokio::test]
async fn test_f3ead_transition_validation() {
    // Test valid transitions
    assert!(validate_f3ead_transition("FIND", "FIX").is_ok());
    assert!(validate_f3ead_transition("FIX", "FINISH").is_ok());
    assert!(validate_f3ead_transition("FINISH", "EXPLOIT").is_ok());
    assert!(validate_f3ead_transition("EXPLOIT", "ANALYZE").is_ok());
    assert!(validate_f3ead_transition("ANALYZE", "DISSEMINATE").is_ok());
    
    // Test invalid transitions
    assert!(validate_f3ead_transition("FIND", "FINISH").is_err()); // Skip stage
    assert!(validate_f3ead_transition("FIX", "FIND").is_err()); // Backwards
    assert!(validate_f3ead_transition("FIND", "FIND").is_err()); // Same stage
}

#[tokio::test]
async fn test_dtl_scoring_calculation() {
    // Test combined score
    let score = DtlScoring::calculate_combined_score(0.8, 0.6);
    assert_eq!(score, 0.72); // (0.8 * 0.6) + (0.6 * 0.4) = 0.48 + 0.24 = 0.72
    
    // Test priority score with aging
    let score_no_aging = DtlScoring::calculate_priority_score("HPT", "CRITICAL", 0);
    let score_aged = DtlScoring::calculate_priority_score("HPT", "CRITICAL", 48);
    assert!(score_aged < score_no_aging);
    
    // Test feasibility score
    let feasibility = DtlScoring::calculate_feasibility_score(1.0, 1.0, 1.0);
    assert_eq!(feasibility, 1.0);
}

#[tokio::test]
async fn test_tst_enforcement() {
    use chrono::{Utc, Duration};
    
    // Test deadline approaching
    let deadline = (Utc::now() + Duration::minutes(20)).to_rfc3339();
    assert!(TstEnforcement::is_deadline_approaching(&deadline, 30));
    
    // Test deadline passed
    let past_deadline = (Utc::now() - Duration::hours(1)).to_rfc3339();
    assert!(TstEnforcement::is_deadline_passed(&past_deadline));
    
    // Test priority calculation
    assert_eq!(TstEnforcement::get_tst_priority(15), "CRITICAL");
    assert_eq!(TstEnforcement::get_tst_priority(90), "HIGH");
    assert_eq!(TstEnforcement::get_tst_priority(300), "MEDIUM");
}
