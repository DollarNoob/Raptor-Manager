use axum::{body::Bytes, extract::{Path, State}, routing::post, Router};
use reqwest::Client;
use std::{path::Component, sync::Arc};
use tauri::{AppHandle, Manager};
use tokio::{fs, sync::Mutex};

#[derive(Clone)]
pub struct AppState {
    pub app_handle: AppHandle,
    pub decompiler: Arc<Mutex<String>>,
}

pub async fn serve(state: AppState) -> Result<(), String> {
    let app = Router::new()
        .route("/decompile", post(decompile))
        .route("/getcustomasset/{id}", post(getcustomasset))
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

async fn getcustomasset(State(state): State<AppState>, Path(id): Path<String>, body: String) -> String {
    let asset_name = body.replace("rbxasset://custom/", "");

    let app_data_dir = state.app_handle.path().app_data_dir().unwrap();

    let asset_dir = app_data_dir.join("environments").join(&id)
        .join("Applications")
        .join("Roblox.app")
        .join("Contents")
        .join("Resources")
        .join("content")
        .join("custom")
        .join(&asset_name);

    if asset_dir.components().any(|c| c == Component::ParentDir) {
        return format!("Asset '{}' attempted path traversal.", &asset_name);
    }

    if !asset_dir.is_file() {
        return format!("Asset '{}' does not exist in the specified directory.", &asset_name);
    }

    // only macsploit needs this fix
    let client_content_dir = app_data_dir.join("clients")
        .join("MacSploit.app")
        .join("Contents")
        .join("Resources")
        .join("content")
        .join("custom")
        .join(&id);

    if client_content_dir.components().any(|c| c == Component::ParentDir) {
        return format!("Profile '{}' attempted path traversal.", &id);
    }

    if let Err(err) = fs::create_dir_all(&client_content_dir).await {
        return err.to_string();
    }

    let client_asset_dir = client_content_dir.join(&asset_name);
    if client_asset_dir.components().any(|c| c == Component::ParentDir) {
        return format!("Asset '{}' attempted path traversal.", &asset_name);
    }

    if let Err(err) = fs::rename(&asset_dir, &client_asset_dir).await {
        return err.to_string();
    }

    format!("rbxasset://custom/{}/{}", &id, &asset_name)
}
