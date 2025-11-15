use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::Manager;

pub mod binarycookies;
mod client;
mod roblox;
mod cookies;
mod config;
mod installer;
mod decompiler;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
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
