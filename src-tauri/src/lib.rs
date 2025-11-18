use axum::error_handling::future::HandleErrorFuture;
use serde::Serialize;
use std::collections::HashMap;
use std::sync::Arc;
use tauri::{Emitter, Listener, Manager};
use tokio::sync::Mutex;
use tauri_plugin_updater::UpdaterExt;

pub mod binarycookies;
mod client;
mod config;
mod cookies;
mod decompiler;
mod hydrobridge;
mod installer;
mod roblox;
mod updater;

#[derive(Debug, Clone, Serialize)]
pub struct Message {
    title: String,
    description: String,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            config::read_config,
            config::write_config,
            config::update_decompiler,
            config::update_hydrobridge,
            config::read_profiles,
            config::write_profiles,
            config::create_environment,
            config::remove_environment,
            config::open_profile_folder,
            roblox::get_roblox_profile,
            roblox::get_roblox_thumbnail,
            client::create_keychain,
            client::unlock_keychain,
            client::modify_bundle_identifier,
            client::launch_client,
            client::stop_client,
            cookies::write_cookies,
            cookies::import_cookies,
            installer::get_roblox_version,
            installer::get_macsploit_version,
            installer::get_hydrogen_version,
            installer::install_client,
            installer::remove_client,
            installer::clean_cache,
            updater::update
        ])
        .setup(|app| {
            let app_handle = app.handle().clone();

            let state = decompiler::AppState {
                app_handle: app_handle.clone(),
                decompiler: Arc::new(Mutex::new("medal".to_string()))
            };

            // Decompiler Init
            app.manage(state.clone());

            let decompiler_app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(err) = decompiler::serve(state).await {
                    let window = decompiler_app_handle.get_webview_window("main").unwrap();
                    window.once("ready", move |_| {
                        let _ = decompiler_app_handle.emit_to("main", "message", Message {
                            title: "Failed to run decompiler server".into(),
                            description: format!("{}\nPlease free port 6767 and restart Manager to use decompiler.", err)
                        });
                    });
                }
            });

            let bridge_state = hydrobridge::AppState {
                queue: Arc::new(Mutex::new(HashMap::new())),
                id: Arc::new(Mutex::new("".to_string()))
            };

            // Hydrobridge Init
            app.manage(bridge_state.clone());

            let hydrobridge_app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(err) = hydrobridge::serve(bridge_state).await {
                    let window = hydrobridge_app_handle.get_webview_window("main").unwrap();
                    window.once("ready", move |_| {
                        let _ = hydrobridge_app_handle.emit_to("main", "message", Message {
                            title: "Failed to run Hydrobridge".into(),
                            description: format!("{}\nPlease close open instances and restart Manager to use Hydrobridge.", err)
                        });
                    });
                }
            });

            // Updater Init
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let update = updater::check_update(handle.clone()).await;
                match update {
                    Ok(update) => {
                        if let Some(version) = update {
                            let _ = handle.emit_to("main", "update", version.clone());

                            let window = handle.get_webview_window("main").unwrap();
                            window.once("ready", move |_| {
                                let _ = handle.emit_to("main", "update", version);
                            });
                        }
                    },
                    Err(err) => {
                        let _ = handle.emit_to("main", "message", Message {
                            title: "Failed to check app updates".into(),
                            description: err.clone()
                        });

                        let window = handle.get_webview_window("main").unwrap();
                        window.once("ready", move |_| {
                            let _ = handle.emit_to("main", "message", Message {
                                title: "Failed to check app updates".into(),
                                description: err
                            });
                        });
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
  if let Some(update) = app.updater()?.check().await? {
    let mut downloaded = 0;

    println!("update current version: {:#?}", update.current_version);
    println!("update download url: {:#?}", update.download_url);
    println!("update raw json: {:#?}", update.raw_json);
    println!("update signature: {:#?}", update.signature);
    println!("update target: {:#?}", update.target);
    println!("update version: {:#?}", update.version);
    // alternatively we could also call update.download() and update.install() separately
    update
      .download_and_install(
        |chunk_length, content_length| {
          downloaded += chunk_length;
          println!("downloaded {downloaded} from {content_length:?}");
        },
        || {
          println!("download finished");
        },
      )
      .await?;

    println!("update installed");
    app.restart();
  }

  Ok(())
}
