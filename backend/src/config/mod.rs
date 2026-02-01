use std::env;
use dotenv::dotenv;

pub use core_auth::config::Config;

pub fn init() {
    dotenv().ok();
}
