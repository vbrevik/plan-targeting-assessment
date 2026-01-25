use tower_cookies::{Cookies, Cookie};
use crate::features::auth::AuthResponse;
use crate::middleware::csrf::{set_csrf_cookie, CSRF_COOKIE_NAME};

pub const ACCESS_TOKEN_COOKIE: &str = "access_token";
pub const REFRESH_TOKEN_COOKIE: &str = "refresh_token";

pub fn set_auth_cookies(cookies: &Cookies, auth: &AuthResponse) {
    let access_cookie = Cookie::build((ACCESS_TOKEN_COOKIE, auth.access_token.clone()))
        .http_only(true)
        .path("/")
        .secure(false) // Explicitly allow insecure for localhost
        .max_age(tower_cookies::cookie::time::Duration::seconds(auth.expires_in))
        .same_site(tower_cookies::cookie::SameSite::Lax)
        .build();
    
    let mut refresh_builder = Cookie::build((REFRESH_TOKEN_COOKIE, auth.refresh_token.clone()))
        .http_only(true)
        .path("/") 
        .secure(false)
        .same_site(tower_cookies::cookie::SameSite::Lax);

    if auth.remember_me {
        // Set to 30 days if remember_me is true
        refresh_builder = refresh_builder.max_age(tower_cookies::cookie::time::Duration::days(30));
    }

    cookies.add(access_cookie);
    cookies.add(refresh_builder.build());
    
    // Also set CSRF cookie
    set_csrf_cookie(cookies);
}

pub fn clear_auth_cookies(cookies: &Cookies) {
    let mut access = Cookie::new(ACCESS_TOKEN_COOKIE, "");
    access.set_path("/");
    access.set_max_age(tower_cookies::cookie::time::Duration::seconds(0));
    cookies.add(access);

    let mut refresh = Cookie::new(REFRESH_TOKEN_COOKIE, "");
    refresh.set_path("/");
    refresh.set_max_age(tower_cookies::cookie::time::Duration::seconds(0));
    cookies.add(refresh);
    
    // Clear CSRF cookie too
    let mut csrf = Cookie::new(CSRF_COOKIE_NAME, "");
    csrf.set_path("/");
    csrf.set_max_age(tower_cookies::cookie::time::Duration::seconds(0));
    cookies.add(csrf);
}
