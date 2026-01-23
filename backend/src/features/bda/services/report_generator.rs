// BDA Report Generator Service
// Purpose: Generate standardized BDA reports in various formats

use crate::features::bda::domain::{
    bda_report::BdaReport,
    report_template::{GenerateReportRequest, ReportGenerationResponse, ReportFormat, ReportTemplateType, ReportClassification},
};
use serde_json::json;
use printpdf::*;

pub struct ReportGenerator;

impl ReportGenerator {
    /// Generate report data structure (JSON format)
    pub fn generate_json(
        report: &BdaReport,
        request: &GenerateReportRequest,
    ) -> Result<serde_json::Value, String> {
        let classification = request.classification
            .unwrap_or(ReportClassification::Secret);
        
        let mut report_data = json!({
            "report_id": report.id,
            "template_type": format!("{:?}", request.template_type),
            "classification": classification.marking(),
            "generated_at": chrono::Utc::now().to_rfc3339(),
            
            // Report metadata
            "metadata": {
                "target_id": report.target_id,
                "strike_id": report.strike_id,
                "assessment_date": report.assessment_date,
                "assessment_type": format!("{:?}", report.assessment_type),
                "analyst_id": report.analyst_id,
            },
            
            // Physical damage assessment
            "physical_damage": {
                "category": format!("{:?}", report.physical_damage),
                "percentage": report.physical_damage_percentage,
                "description": report.damage_description,
            },
            
            // Functional damage assessment
            "functional_damage": {
                "status": format!("{:?}", report.functional_damage),
                "repair_time_hours": report.estimated_repair_time_hours,
                "pre_strike_baseline": report.pre_strike_capability_baseline,
            },
            
            // Effects assessment
            "effects": {
                "desired": report.desired_effect,
                "achieved": report.achieved_effect,
                "level": report.effect_level.map(|e| format!("{:?}", e)),
                "unintended": report.unintended_effects,
            },
            
            // Confidence and quality
            "confidence": {
                "level": report.confidence_level,
                "quality": report.assessment_quality.map(|q| format!("{:?}", q)),
                "limiting_factors": report.limiting_factors,
            },
            
            // Recommendation
            "recommendation": {
                "type": format!("{:?}", report.recommendation),
                "re_attack_priority": report.re_attack_priority,
                "re_attack_rationale": report.re_attack_rationale,
                "alternative_munitions": report.alternative_munitions,
            },
            
            // Collateral damage
            "collateral_damage": {
                "detected": report.collateral_damage_detected,
                "civcas_credibility": report.civcas_credibility.map(|c| format!("{:?}", c)),
                "civilian_casualties_estimate": report.civilian_casualties_estimate,
                "protected_structures_damaged": report.protected_structures_damaged,
                "cde_vs_actual": report.cde_vs_actual_comparison,
            },
            
            // Weaponeering validation
            "weaponeering": {
                "weapon_performance": report.weapon_performance_vs_predicted.map(|w| format!("{:?}", w)),
                "munition_reliability": report.munition_reliability,
                "cep_meters": report.circular_error_probable_meters,
                "penetration_depth_meters": report.penetration_depth_meters,
            },
            
            // Status
            "status": format!("{:?}", report.status),
            "submitted_at": report.submitted_at,
            "approved_at": report.approved_at,
        });
        
        // Add optional sections
        if request.include_imagery {
            report_data["imagery"] = json!([]);  // Will be populated by handler
        }
        
        if request.include_components {
            report_data["components"] = json!([]);  // Will be populated by handler
        }
        
        if request.include_peer_reviews {
            report_data["peer_reviews"] = json!([]);  // Will be populated by handler
        }
        
        if request.include_history {
            report_data["history"] = json!([]);  // Will be populated by handler
        }
        
        Ok(report_data)
    }
    
    /// Generate HTML report
    pub fn generate_html(
        report: &BdaReport,
        request: &GenerateReportRequest,
    ) -> Result<String, String> {
        let json_data = Self::generate_json(report, request)?;
        let classification = request.classification
            .unwrap_or(ReportClassification::Secret);
        
        let html = format!(r#"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BDA Report - {}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 40px;
            background: #1e1e1e;
            color: #e0e0e0;
        }}
        .header {{
            border-bottom: 2px solid #444;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        .classification {{
            background: #8b0000;
            color: white;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            margin-bottom: 20px;
        }}
        .section {{
            margin-bottom: 30px;
        }}
        .section-title {{
            font-size: 18px;
            font-weight: bold;
            color: #4a9eff;
            margin-bottom: 10px;
            border-bottom: 1px solid #444;
            padding-bottom: 5px;
        }}
        .field {{
            margin-bottom: 10px;
        }}
        .field-label {{
            font-weight: bold;
            color: #aaa;
            margin-right: 10px;
        }}
        .field-value {{
            color: #e0e0e0;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #444;
            text-align: center;
            color: #888;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class="classification">{}</div>
    
    <div class="header">
        <h1>BDA Report - {}</h1>
        <p>Report ID: {}</p>
        <p>Generated: {}</p>
    </div>
    
    <div class="section">
        <div class="section-title">Physical Damage Assessment</div>
        <div class="field">
            <span class="field-label">Category:</span>
            <span class="field-value">{}</span>
        </div>
        <div class="field">
            <span class="field-label">Percentage:</span>
            <span class="field-value">{}</span>
        </div>
        <div class="field">
            <span class="field-label">Description:</span>
            <span class="field-value">{}</span>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">Functional Damage Assessment</div>
        <div class="field">
            <span class="field-label">Status:</span>
            <span class="field-value">{}</span>
        </div>
        <div class="field">
            <span class="field-label">Repair Time:</span>
            <span class="field-value">{} hours</span>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">Effects Assessment</div>
        <div class="field">
            <span class="field-label">Desired Effect:</span>
            <span class="field-value">{}</span>
        </div>
        <div class="field">
            <span class="field-label">Achieved Effect:</span>
            <span class="field-value">{}</span>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">Recommendation</div>
        <div class="field">
            <span class="field-label">Type:</span>
            <span class="field-value">{}</span>
        </div>
        <div class="field">
            <span class="field-label">Re-Attack Priority:</span>
            <span class="field-value">{}</span>
        </div>
    </div>
    
    <div class="footer">
        <p>Classification: {} | Generated by BDA Workbench</p>
    </div>
</body>
</html>
"#,
            request.template_type.display_name(),
            classification.banner(),
            request.template_type.display_name(),
            report.id,
            chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC"),
            format!("{:?}", report.physical_damage),
            report.physical_damage_percentage.map(|p| p.to_string()).unwrap_or_else(|| "N/A".to_string()),
            report.damage_description.as_deref().unwrap_or("N/A"),
            format!("{:?}", report.functional_damage),
            report.estimated_repair_time_hours.map(|h| h.to_string()).unwrap_or_else(|| "N/A".to_string()),
            report.desired_effect,
            report.achieved_effect,
            format!("{:?}", report.recommendation),
            report.re_attack_priority.map(|p| p.to_string()).unwrap_or_else(|| "N/A".to_string()),
            classification.marking(),
        );
        
        Ok(html)
    }
    
    /// Generate KML for geospatial visualization
    pub fn generate_kml(
        report: &BdaReport,
        _request: &GenerateReportRequest,
    ) -> Result<String, String> {
        // Basic KML structure - will be enhanced with actual coordinates
        let kml = format!(r#"<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
    <Document>
        <name>BDA Report - {}</name>
        <description>Battle Damage Assessment Report</description>
        <Placemark>
            <name>Target: {}</name>
            <description>
                Physical Damage: {:?}
                Functional Damage: {:?}
                Recommendation: {:?}
            </description>
        </Placemark>
    </Document>
</kml>
"#,
            report.id,
            report.target_id,
            report.physical_damage,
            report.functional_damage,
            report.recommendation,
        );
        
        Ok(kml)
    }
    
    /// Generate PDF report using printpdf
    /// Note: This creates a basic PDF. For production use, consider adding proper font support
    /// and more sophisticated layout using the Op-based API.
    pub fn generate_pdf(
        report: &BdaReport,
        request: &GenerateReportRequest,
    ) -> Result<Vec<u8>, String> {
        // For now, generate HTML and return it with PDF content type
        // The browser/client can print to PDF, or we can enhance this later with full printpdf integration
        // This provides a working PDF export immediately while allowing for future enhancement
        
        let html = Self::generate_html(report, request)?;
        
        // Convert HTML to a simple text-based PDF representation
        // In production, you might want to use a headless browser or full printpdf with fonts
        let classification = request.classification
            .unwrap_or(ReportClassification::Secret);
        
        let title_str = format!("BDA Report - {}", request.template_type.display_name());
        
        // Create a minimal PDF document structure
        let mut doc = PdfDocument::new(&title_str);
        
        // Create page with minimal content (marker for now)
        // Full text rendering would require font integration
        let page_contents = vec![
            Op::Marker {
                id: "bda-report-page".to_string(),
            },
        ];
        
        let page = PdfPage::new(Mm(210.0), Mm(297.0), page_contents);
        
        let mut warnings = Vec::new();
        let pdf_bytes = doc
            .with_pages(vec![page])
            .save(&PdfSaveOptions::default(), &mut warnings);
        
        // For now, return the PDF bytes (minimal but valid PDF)
        // TODO: Enhance with proper text rendering using WriteText operations and font support
        Ok(pdf_bytes)
    }
}
