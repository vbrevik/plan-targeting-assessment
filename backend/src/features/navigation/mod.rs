use axum::{
    routing::get,
    Router,
    extract::{State, Path},
    http::StatusCode,
    response::Json,
};
use crate::features::auth::jwt::Claims;
use axum::Extension;
use serde::Serialize;
use crate::features::ontology::OntologyService;
use crate::features::abac::AbacService;

#[derive(Debug, Serialize, Clone)]
pub struct ActionItem {
    pub id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub datasets: Option<Vec<DatasetItem>>,
}

#[derive(Debug, Serialize, Clone)]
pub struct DatasetItem {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Serialize)]
pub struct SidebarItem {
    pub label: String,
    pub to: String,
    pub icon: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub permission: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actions: Option<Vec<ActionItem>>,
}

#[derive(Debug, Serialize)]
pub struct SidebarGroup {
    pub label: String,
    pub items: Vec<SidebarItem>,
}

pub fn navigation_router<S>(ontology_service: OntologyService, abac_service: AbacService) -> Router<S>
where
    S: Clone + Send + Sync + 'static,
{
    Router::new()
        .route("/", get(get_navigation))
        .route("/:role_id", get(get_navigation_for_role))
        .with_state(NavigationState { ontology_service, abac_service })
}

#[derive(Clone)]
pub struct NavigationState {
    pub ontology_service: OntologyService,
    pub abac_service: AbacService,
}

/// Get navigation for the current logged-in user based on their roles
pub async fn get_navigation(
    State(state): State<NavigationState>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<Vec<SidebarGroup>>, StatusCode> {
    let user_id = &claims.sub;
    
    // Get user roles from ABAC
    let user_roles = state.abac_service.get_user_roles(user_id).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let role_ids: Vec<String> = user_roles.into_iter().map(|r| r.role_name).collect();
    
    build_navigation_for_roles(&state, &role_ids).await
}

/// Get navigation for a specific role (admin/preview use case)
pub async fn get_navigation_for_role(
    State(state): State<NavigationState>,
    Path(role_id): Path<String>,
) -> Result<Json<Vec<SidebarGroup>>, StatusCode> {
    build_navigation_for_roles(&state, &[role_id]).await
}

/// Core logic: Build navigation tree for given roles
async fn build_navigation_for_roles(
    state: &NavigationState,
    role_ids: &[String],
) -> Result<Json<Vec<SidebarGroup>>, StatusCode> {
    
    // 1. Query ontology for all MenuItem entities
    let menu_filter = crate::features::ontology::models::EntityFilter {
        type_: Some("MenuItem".to_string()),
        operation_id: None,
        campaign_id: None,
    };
    
    let menu_entities = state.ontology_service.get_entities(menu_filter).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if menu_entities.is_empty() {
        // Return default/static menu if ontology is not seeded yet
        return Ok(Json(vec![
            SidebarGroup {
                label: "Systems".to_string(),
                items: vec![
                    SidebarItem { 
                        label: "IM Dashboard".to_string(), 
                        to: "/smartops/im-dashboard".to_string(), 
                        icon: "LayoutDashboard".to_string(), 
                        permission: None,
                        actions: None,
                    },
                    SidebarItem { 
                        label: "Menu Builder".to_string(), 
                        to: "/smartops/menu-builder".to_string(), 
                        icon: "Settings".to_string(), 
                        permission: Some("menu.manage".to_string()),
                        actions: None,
                    },
                ],
            }
        ]));
    }

    // 2. Query all Action entities for caching
    let action_filter = crate::features::ontology::models::EntityFilter {
        type_: Some("Action".to_string()),
        operation_id: None,
        campaign_id: None,
    };
    let all_actions = state.ontology_service.get_entities(action_filter).await
        .unwrap_or_default();

    // 3. Query all Dataset entities for caching
    let dataset_filter = crate::features::ontology::models::EntityFilter {
        type_: Some("Dataset".to_string()),
        operation_id: None,
        campaign_id: None,
    };
    let all_datasets = state.ontology_service.get_entities(dataset_filter).await
        .unwrap_or_default();

    let mut item_map: std::collections::HashMap<String, SidebarGroup> = std::collections::HashMap::new();

    for entity in menu_entities {
        // Check if this menu item is assigned to any of the given roles
        let assigned_rels = state.ontology_service
            .get_relationships(Some(entity.id.clone()), None, Some("assigned_to".to_string()))
            .await
            .unwrap_or_default();
        
        let is_assigned = assigned_rels.iter().any(|r| role_ids.contains(&r.target_id));
        
        if !is_assigned {
            continue;
        }

        let props = entity.properties.clone().unwrap_or_default();
        let group_label = props.get("group").and_then(|v| v.as_str()).unwrap_or("General").to_string();

        // 4. Get actions linked to this menu item via `performs_action`
        let action_rels = state.ontology_service
            .get_relationships(Some(entity.id.clone()), None, Some("performs_action".to_string()))
            .await
            .unwrap_or_default();

        let mut menu_actions: Vec<ActionItem> = Vec::new();

        for action_rel in action_rels {
            let action_id = &action_rel.target_id;

            // Check if this action is available for the role
            let available_rels = state.ontology_service
                .get_relationships(Some(action_id.clone()), None, Some("available_for".to_string()))
                .await
                .unwrap_or_default();

            let is_available = available_rels.is_empty() || available_rels.iter().any(|r| role_ids.contains(&r.target_id));

            if !is_available {
                continue;
            }

            // Find the action entity
            let action_entity = all_actions.iter().find(|a| &a.id == action_id);
            if let Some(action) = action_entity {
                // Get datasets this action operates on
                let dataset_rels = state.ontology_service
                    .get_relationships(Some(action_id.clone()), None, Some("operates_on".to_string()))
                    .await
                    .unwrap_or_default();

                let datasets: Vec<DatasetItem> = dataset_rels
                    .iter()
                    .filter_map(|dr| {
                        all_datasets.iter()
                            .find(|d| d.id == dr.target_id)
                            .map(|d| DatasetItem { id: d.id.clone(), name: d.name.clone() })
                    })
                    .collect();

                menu_actions.push(ActionItem {
                    id: action.id.clone(),
                    name: action.name.clone(),
                    datasets: if datasets.is_empty() { None } else { Some(datasets) },
                });
            }
        }

        let item = SidebarItem {
            label: entity.name,
            to: props.get("to").and_then(|v| v.as_str()).unwrap_or("#").to_string(),
            icon: props.get("icon").and_then(|v| v.as_str()).unwrap_or("Menu").to_string(),
            permission: props.get("permission").and_then(|v| v.as_str()).map(|s| s.to_string()),
            actions: if menu_actions.is_empty() { None } else { Some(menu_actions) },
        };

        item_map.entry(group_label.clone())
            .or_insert(SidebarGroup { label: group_label, items: Vec::new() })
            .items.push(item);
    }

    let mut result: Vec<SidebarGroup> = item_map.into_values().collect();
    result.sort_by(|a, b| a.label.cmp(&b.label));

    Ok(Json(result))
}
