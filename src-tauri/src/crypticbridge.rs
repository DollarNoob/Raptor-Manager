use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    extract::{Path, State},
    routing::get,
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
        .route("/", get(ws))
        .route("/queue/{id}", get(queue))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:5200")
        .await
        .map_err(|e| e.to_string())?;
    axum::serve(listener, app)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

async fn ws(
    State(state): State<AppState>,
    ws: WebSocketUpgrade,
) -> impl axum::response::IntoResponse {
    return ws.on_upgrade(|socket| handle_socket(socket, state));
}

async fn handle_socket(mut socket: WebSocket, state: AppState) {
    while let Some(Ok(msg)) = socket.recv().await {
        match msg {
            Message::Text(text) => {
                let mut queue = state.queue.lock().await;
                let id = state.id.lock().await;

                if id.is_empty() {
                    continue;
                }

                queue
                    .entry(id.to_string())
                    .or_insert_with(Vec::new)
                    .push(text.to_string());
            }
            Message::Binary(bin) => {
                let _ = socket.send(Message::Binary(bin)).await;
            }
            Message::Close(_) => break,
            _ => {}
        }
    }
}

async fn queue(State(state): State<AppState>, Path(id): Path<String>) -> Json<Vec<String>> {
    let mut queue = state.queue.lock().await;

    let list = queue.remove(&id).unwrap_or_default();
    Json(list)
}
