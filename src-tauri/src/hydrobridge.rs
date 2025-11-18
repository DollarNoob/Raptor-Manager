use axum::{
    body::Bytes,
    extract::{Path, State},
    routing::{get, post},
    Json, Router,
};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct AppState {
    pub queue: Arc<Mutex<HashMap<String, Vec<String>>>>,
    pub id: Arc<Mutex<String>>,
}

pub async fn serve(state: AppState) -> Result<(), String> {
    let app = Router::new()
        .route("/secret", get(secret))
        .route("/queue/{id}", get(queue))
        .route("/execute", post(execute))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:6969")
        .await
        .map_err(|e| e.to_string())?;
    axum::serve(listener, app)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

async fn secret() -> String {
    "0xdeadbeef".to_string()
}

async fn queue(State(state): State<AppState>, Path(id): Path<String>) -> Json<Vec<String>> {
    let mut queue = state.queue.lock().await;

    let list = queue.remove(&id).unwrap_or_default();
    Json(list)
}

async fn execute(State(state): State<AppState>, body: Bytes) -> String {
    let mut queue = state.queue.lock().await;
    let id = state.id.lock().await;

    if id.is_empty() {
        return "Script queued".to_string();
    }

    let payload = String::from_utf8_lossy(&body).to_string();
    queue
        .entry(id.to_string())
        .or_insert_with(Vec::new)
        .push(payload);

    "Script queued".to_string()
}
