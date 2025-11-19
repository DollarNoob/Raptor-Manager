use axum::{body::Bytes, extract::State, routing::post, Router};
use reqwest::Client;
use std::sync::Arc;
use tauri::AppHandle;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct AppState {
    pub app_handle: AppHandle,
    pub decompiler: Arc<Mutex<String>>,
}

pub async fn serve(state: AppState) -> Result<(), String> {
    let app = Router::new()
        .route("/decompile", post(decompile))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:6767")
        .await
        .map_err(|e| e.to_string())?;
    axum::serve(listener, app)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

async fn decompile(State(state): State<AppState>, body: Bytes) -> String {
    if *state.decompiler.lock().await == "medal" {
        decompile_medal(body)
    } else {
        decompile_konstant(state.app_handle, body).await
    }
}

pub fn decompile_medal(bytecode: Bytes) -> String {
    let decompiled = luau_lifter::decompile_bytecode(&bytecode, 203);
    match decompiled {
        Ok(script) => script,
        Err(err) => format!(
            "-- Error occured while decompiling, error:\n\n--[[\n{}\n--]]",
            err
        ),
    }
}

pub async fn decompile_konstant(app_handle: AppHandle, bytecode: Bytes) -> String {
    let client = Client::new();
    let response = client
        .post("http://api.plusgiant5.com/konstant/decompile")
        .header("Content-Type", "text/plain")
        .header(
            "User-Agent",
            format!(
                "RaptorManager/{}",
                app_handle.package_info().version.to_string()
            ),
        )
        .body(bytecode)
        .send()
        .await;

    match response {
        Ok(response) => {
            let status = response.status();
            if !status.is_success() {
                return format!(
                    "-- Error occured while decompiling, status:\n\n--[[\n{}\n--]]",
                    status.to_string()
                );
            }

            let body = response.text().await;
            match body {
                Ok(body) => body,
                Err(err) => format!(
                    "-- Error occured while reading body, error:\n\n--[[\n{}\n--]]",
                    err.to_string()
                ),
            }
        }
        Err(err) => format!(
            "-- Error occured while requesting, error:\n\n--[[\n{}\n--]]",
            err.to_string()
        ),
    }
}
