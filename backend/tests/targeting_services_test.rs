// Unit tests for targeting services
// Tests F3EAD transitions, DTL scoring, TST enforcement

use template_repo_backend::features::targeting::services::{
    F3EADStage, validate_f3ead_transition,
    DtlScoring,
    TstEnforcement,
};

#[test]
fn test_f3ead_stage_from_str() {
    assert_eq!(F3EADStage::from_str("FIND"), Some(F3EADStage::Find));
    assert_eq!(F3EADStage::from_str("find"), Some(F3EADStage::Find));
    assert_eq!(F3EADStage::from_str("FIX"), Some(F3EADStage::Fix));
    assert_eq!(F3EADStage::from_str("FINISH"), Some(F3EADStage::Finish));
    assert_eq!(F3EADStage::from_str("EXPLOIT"), Some(F3EADStage::Exploit));
    assert_eq!(F3EADStage::from_str("ANALYZE"), Some(F3EADStage::Analyze));
    assert_eq!(F3EADStage::from_str("DISSEMINATE"), Some(F3EADStage::Disseminate));
    assert_eq!(F3EADStage::from_str("INVALID"), None);
}

#[test]
fn test_f3ead_stage_next() {
    assert_eq!(F3EADStage::Find.next(), Some(F3EADStage::Fix));
    assert_eq!(F3EADStage::Fix.next(), Some(F3EADStage::Finish));
    assert_eq!(F3EADStage::Finish.next(), Some(F3EADStage::Exploit));
    assert_eq!(F3EADStage::Exploit.next(), Some(F3EADStage::Analyze));
    assert_eq!(F3EADStage::Analyze.next(), Some(F3EADStage::Disseminate));
    assert_eq!(F3EADStage::Disseminate.next(), None);
}

#[test]
fn test_f3ead_stage_can_transition_to() {
    let find = F3EADStage::Find;
    assert!(find.can_transition_to("FIX"));
    assert!(find.can_transition_to("fix"));
    assert!(!find.can_transition_to("FINISH")); // Can't skip stages
    assert!(!find.can_transition_to("FIND")); // Can't stay same
    
    let disseminate = F3EADStage::Disseminate;
    assert!(!disseminate.can_transition_to("FIND")); // Final stage
}

#[test]
fn test_validate_f3ead_transition_valid() {
    assert!(validate_f3ead_transition("FIND", "FIX").is_ok());
    assert!(validate_f3ead_transition("FIX", "FINISH").is_ok());
    assert!(validate_f3ead_transition("FINISH", "EXPLOIT").is_ok());
    assert!(validate_f3ead_transition("EXPLOIT", "ANALYZE").is_ok());
    assert!(validate_f3ead_transition("ANALYZE", "DISSEMINATE").is_ok());
}

#[test]
fn test_validate_f3ead_transition_invalid() {
    // Can't skip stages
    assert!(validate_f3ead_transition("FIND", "FINISH").is_err());
    assert!(validate_f3ead_transition("FIX", "EXPLOIT").is_err());
    
    // Can't go backwards
    assert!(validate_f3ead_transition("FIX", "FIND").is_err());
    assert!(validate_f3ead_transition("FINISH", "FIX").is_err());
    
    // Can't stay same
    assert!(validate_f3ead_transition("FIND", "FIND").is_err());
    
    // Invalid stage names
    assert!(validate_f3ead_transition("INVALID", "FIX").is_err());
    assert!(validate_f3ead_transition("FIND", "INVALID").is_err());
}

#[test]
fn test_dtl_scoring_combined_score() {
    // Test combined score calculation: (priority * 0.6) + (feasibility * 0.4)
    let score = DtlScoring::calculate_combined_score(1.0, 1.0);
    assert_eq!(score, 1.0);
    
    let score = DtlScoring::calculate_combined_score(0.5, 0.5);
    assert_eq!(score, 0.5);
    
    let score = DtlScoring::calculate_combined_score(1.0, 0.0);
    assert_eq!(score, 0.6);
    
    let score = DtlScoring::calculate_combined_score(0.0, 1.0);
    assert_eq!(score, 0.4);
}

#[test]
fn test_dtl_scoring_priority_score() {
    // HPT should have highest weight
    let score = DtlScoring::calculate_priority_score("HPT", "CRITICAL", 0);
    assert!(score > 0.9);
    
    // TST should be high
    let score = DtlScoring::calculate_priority_score("TST", "HIGH", 0);
    assert!(score > 0.8);
    
    // Aging penalty should reduce score
    let score_no_aging = DtlScoring::calculate_priority_score("HPT", "CRITICAL", 0);
    let score_24h = DtlScoring::calculate_priority_score("HPT", "CRITICAL", 24);
    assert!(score_24h < score_no_aging);
    
    // Max aging penalty is 20%
    let score_480h = DtlScoring::calculate_priority_score("HPT", "CRITICAL", 480);
    let score_1000h = DtlScoring::calculate_priority_score("HPT", "CRITICAL", 1000);
    assert_eq!(score_480h, score_1000h); // Both at max penalty
}

#[test]
fn test_dtl_scoring_feasibility_score() {
    // Perfect conditions
    let score = DtlScoring::calculate_feasibility_score(1.0, 1.0, 1.0);
    assert_eq!(score, 1.0);
    
    // All poor conditions
    let score = DtlScoring::calculate_feasibility_score(0.0, 0.0, 0.0);
    assert_eq!(score, 0.0);
    
    // Weighted average: ISR 40%, Weather 30%, ROE 30%
    let score = DtlScoring::calculate_feasibility_score(1.0, 0.0, 0.0);
    assert_eq!(score, 0.4);
    
    let score = DtlScoring::calculate_feasibility_score(0.0, 1.0, 0.0);
    assert_eq!(score, 0.3);
    
    let score = DtlScoring::calculate_feasibility_score(0.0, 0.0, 1.0);
    assert_eq!(score, 0.3);
}

#[test]
fn test_dtl_scoring_aging_hours() {
    use chrono::Utc;
    
    // Test with current time
    let now = Utc::now();
    let created_at = now.format("%Y-%m-%d %H:%M:%S").to_string();
    let hours = DtlScoring::calculate_aging_hours(&created_at);
    assert_eq!(hours, 0);
    
    // Test with 24 hours ago
    let past = now - chrono::Duration::hours(24);
    let created_at = past.format("%Y-%m-%d %H:%M:%S").to_string();
    let hours = DtlScoring::calculate_aging_hours(&created_at);
    assert_eq!(hours, 24);
}

#[test]
fn test_tst_enforcement_deadline_approaching() {
    use chrono::{Utc, Duration};
    
    // Deadline in 15 minutes (within 30 minute threshold)
    let deadline = (Utc::now() + Duration::minutes(15)).to_rfc3339();
    assert!(TstEnforcement::is_deadline_approaching(&deadline, 30));
    
    // Deadline in 45 minutes (outside 30 minute threshold)
    let deadline = (Utc::now() + Duration::minutes(45)).to_rfc3339();
    assert!(!TstEnforcement::is_deadline_approaching(&deadline, 30));
    
    // Deadline passed
    let deadline = (Utc::now() - Duration::minutes(15)).to_rfc3339();
    assert!(!TstEnforcement::is_deadline_approaching(&deadline, 30));
}

#[test]
fn test_tst_enforcement_deadline_passed() {
    use chrono::{Utc, Duration};
    
    // Deadline in future
    let deadline = (Utc::now() + Duration::hours(1)).to_rfc3339();
    assert!(!TstEnforcement::is_deadline_passed(&deadline));
    
    // Deadline passed
    let deadline = (Utc::now() - Duration::hours(1)).to_rfc3339();
    assert!(TstEnforcement::is_deadline_passed(&deadline));
}

#[test]
fn test_tst_enforcement_minutes_remaining() {
    use chrono::{Utc, Duration};
    
    // 30 minutes remaining
    let deadline = (Utc::now() + Duration::minutes(30)).to_rfc3339();
    let remaining = TstEnforcement::minutes_remaining(&deadline);
    assert!(remaining.is_some());
    assert!(remaining.unwrap() >= 29 && remaining.unwrap() <= 31);
    
    // Past deadline
    let deadline = (Utc::now() - Duration::minutes(30)).to_rfc3339();
    let remaining = TstEnforcement::minutes_remaining(&deadline);
    assert!(remaining.is_some());
    assert!(remaining.unwrap() < 0);
}

#[test]
fn test_tst_enforcement_priority() {
    assert_eq!(TstEnforcement::get_tst_priority(15), "CRITICAL");
    assert_eq!(TstEnforcement::get_tst_priority(60), "HIGH");
    assert_eq!(TstEnforcement::get_tst_priority(180), "MEDIUM");
    assert_eq!(TstEnforcement::get_tst_priority(500), "LOW");
}
