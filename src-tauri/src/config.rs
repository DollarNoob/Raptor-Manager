use std::{fs::{self, File}, io::{Read, Write}, process::Command, vec};
use serde::{Serialize, Deserialize};
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub client: Option<String>,
    pub clients: Vec<Client>,
    pub decompiler: String
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Client {
    pub name: String,
    pub version: String
}

#[tauri::command]
pub fn read_config(app_handle: AppHandle) -> Result<Config, String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let config_dir = app_data_dir.join("config.json");
    if !config_dir.exists() {
        let default_config = Config {
            client: None,
            clients: vec![],
            decompiler: "medal".into()
        };
        write_config(app_handle, default_config.clone()).map_err(|e| e.to_string())?;
        return Ok(default_config);
    }

    let mut file = File::open(&config_dir).map_err(|e| e.to_string())?;

    let mut contents = String::new();
    file.read_to_string(&mut contents).map_err(|e| e.to_string())?;

    let config = serde_json::from_str::<Config>(&contents).map_err(|e| e.to_string())?;
    Ok(config)
}

#[tauri::command]
pub fn write_config(app_handle: AppHandle, config: Config) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();
    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;
    }

    let config_dir = app_data_dir.join("config.json");

    let contents = serde_json::to_string::<Config>(&config).map_err(|e| e.to_string())?;

    let mut file = File::create(&config_dir).map_err(|e| e.to_string())?;
    file.write_all(&contents.as_bytes()).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn update_decompiler(state: tauri::State<'_, crate::decompiler::AppState>, decompiler: String) -> Result<(), ()> {
    let mut decom_config = state.decompiler.lock().await;
    *decom_config = decompiler;
    Ok(())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct Profile {
    pub id: String,
    pub name: Option<String>,
    pub cookie: String,
    pub userId: i64,
    pub displayName: String,
    pub username: String,
    pub thumbnail: String,
    pub note: String,
    pub lastPlayedAt: u64
}

#[tauri::command]
pub fn read_profiles(app_handle: AppHandle) -> Result<Vec<Profile>, String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let profile_dir = app_data_dir.join("profiles.json");
    if !profile_dir.exists() {
        write_profiles(app_handle, vec![]).map_err(|e| e.to_string())?;
        return Ok(vec![]);
    }

    let mut file = File::open(&profile_dir).map_err(|e| e.to_string())?;

    let mut contents = String::new();
    file.read_to_string(&mut contents).map_err(|e| e.to_string())?;

    let profiles = serde_json::from_str::<Vec<Profile>>(&contents).map_err(|e| e.to_string())?;
    Ok(profiles)
}

#[tauri::command]
pub fn write_profiles(app_handle: AppHandle, profiles: Vec<Profile>) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let profile_dir = app_data_dir.join("profiles.json");
    if !profile_dir.exists() {
        fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;
    }

    let profile = serde_json::to_string::<Vec<Profile>>(&profiles).map_err(|e| e.to_string())?;

    let mut file = File::create(&profile_dir).map_err(|e| e.to_string())?;
    file.write_all(&profile.as_bytes()).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn create_environment(app_handle: AppHandle, id: String) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let profile_dir = app_data_dir.join("environments").join(id);
    fs::create_dir_all(&profile_dir).map_err(|e| e.to_string())?;

    // MacSploit - Documents
    let documents_dir = profile_dir.join("Documents");
    fs::create_dir_all(&documents_dir).map_err(|e| e.to_string())?;

    // MacSploit - Downloads
    let downloads_dir = profile_dir.join("Downloads");
    fs::create_dir_all(&downloads_dir).map_err(|e| e.to_string())?;

    // Roblox - Custom Assets
    let content_dir = profile_dir.join("Applications").join("Roblox.app").join("Contents").join("Resources").join("content");
    fs::create_dir_all(&content_dir).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn remove_environment(app_handle: AppHandle, id: String) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let environment_dir = app_data_dir.join("environments");
    let profile_dir = environment_dir.join(&id);
    if !profile_dir.exists() {
        fs::create_dir_all(&environment_dir).map_err(|e| e.to_string())?;
        return Ok(());
    }

    fs::remove_dir_all(&profile_dir).map_err(|e| e.to_string())?;

    let data_dir = app_handle.path().data_dir().unwrap();
    let library_dir = data_dir.parent().unwrap(); // $HOME/Library
    let http_storages_dir = library_dir.join("HTTPStorages");

    fs::remove_dir_all(http_storages_dir.join(format!("com.roblox.RobloxPlayer.{}", &id))).map_err(|e| e.to_string())?;
    fs::remove_file(http_storages_dir.join(format!("com.roblox.RobloxPlayer.{}.binarycookies", &id))).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn open_profile_folder(app_handle: AppHandle, id: String) -> Result<i32, String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let profile_dir = app_data_dir.join("environments").join(id);
    let exists = fs::exists(&profile_dir).map_err(|e| e.to_string())?;
    if !exists {
        return Err("Profile folder does not exist. Please delete and create a profile again.".into());
    }

    let mut child = Command::new("open")
        .args(&profile_dir.to_str())
        .spawn()
        .map_err(|e| e.to_string())?;

    let status = child.wait().map_err(|e| e.to_string())?;
    if let Some(code) = status.code() {
        Ok(code)
    } else {
        Ok(-1)
    }
}
