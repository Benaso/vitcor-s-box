use axum::{Router, routing::get};
use serde::Serialize;

#[derive(Serialize)]
struct Profile {
    name: String,
    title: String,
    bio: String,
}

#[derive(Serialize)]
struct Status {
    projects: String,
    experience: String,
    stack: String,
}

#[derive(Serialize)]
struct HomeData {
    profile: Profile,
    status: Status,
}

async fn home() -> axum::Json<HomeData> {
    axum::Json(HomeData {
        profile: Profile {
            name: "Moon".to_string(),
            title: "全栈开发者".to_string(),
            bio: "Rust · React · WebAssembly\n热爱技术与创造".to_string(),
        },
        status: Status {
            projects: "10+".to_string(),
            experience: "5Y".to_string(),
            stack: "RUST/REACT".to_string(),
        },
    })
}

pub fn router() -> Router {
    Router::new().route("/home", get(home))
}