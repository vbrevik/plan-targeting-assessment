pub mod models;
pub mod service;
pub mod routes;

pub use service::OntologyService;
pub use routes::ontology_router;

#[cfg(test)]
mod tests;
