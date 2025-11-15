use std::sync::Arc;
use serde::Serialize;
use tokio::sync::Mutex;
use std::collections::HashMap;
use tauri::{Emitter, Listener, Manager};

pub mod binarycookies;
mod client;
mod roblox;
mod cookies;
mod config;
mod installer;
mod decompiler;
mod hydrobridge;

#[derive(Debug, Clone, Serialize)]
pub struct Message {
    title: String,
    description: String
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
            installer::clean_cache
        ])
        .setup(|app| {
            let app_handle = app.handle().clone();

            let state = decompiler::AppState {
                app_handle: app_handle.clone(),
                decompiler: Arc::new(Mutex::new("medal".to_string()))
            };

            app.manage(state.clone());

            let decompiler_app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(err) = decompiler::serve(state).await {
                    let window = decompiler_app_handle.get_webview_window("main").unwrap();

                    window.listen("ready", move |_| {
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

            app.manage(bridge_state.clone());

            let hydrobridge_app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(err) = hydrobridge::serve(bridge_state).await {
                    let window = hydrobridge_app_handle.get_webview_window("main").unwrap();

                    window.listen("ready", move |_| {
                        let _ = hydrobridge_app_handle.emit_to("main", "message", Message {
                            title: "Failed to run Hydrobridge".into(),
                            description: format!("{}\nPlease close open instances and restart Manager to use Hydrobridge.", err)
                        });
                    });
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
