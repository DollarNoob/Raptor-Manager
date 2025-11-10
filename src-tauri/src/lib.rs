use std::sync::Arc;
use tokio::sync::Mutex;

pub mod binarycookies;
mod client;
mod roblox;
mod cookies;
mod config;
mod installer;
mod decompiler;
use tauri::Manager;

// #[tauri::command]
// async fn test(body: Vec<u8>) -> Result<String, String> {
//     let decompiled = luau_lifter::decompile_bytecode(&body, 203);
//     println!("Successfully decompiled bytecode.");
//     Ok(decompiled)
// }

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            config::read_config,
            config::write_config,
            config::update_decompiler,
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
            cookies::read_cookies,
            cookies::write_cookies,
            cookies::import_cookies,
            installer::get_roblox_version,
            installer::get_macsploit_version,
            installer::get_hydrogen_version,
            installer::install_client,
            installer::remove_client
        ])
        .setup(|app| {
            let app_handle = app.handle().clone();

            let state = decompiler::AppState {
                app_handle: app_handle.clone(),
                decompiler: Arc::new(Mutex::new("medal".to_string()))
            };

            app.manage(state.clone());

            tauri::async_runtime::spawn(async move {
                decompiler::serve(state).await;
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
