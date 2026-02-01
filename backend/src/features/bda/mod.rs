// BDA Feature Module
// Purpose: Battle Damage Assessment system per NATO COPD & JP 3-60
// ONTOLOGY-FIRST: Simplified to remove legacy code

pub mod handlers;
pub mod router;

pub use router::router;
pub use router::BdaState;
