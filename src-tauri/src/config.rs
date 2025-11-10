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
        match write_config(app_handle, default_config.clone()) {
            Ok(_) => return Ok(default_config),
            Err(err) => return Err(err)
        }
    }

    match File::open(&config_dir) {
        Ok(mut file) => {
            let mut contents = String::new();
            match file.read_to_string(&mut contents) {
                Ok(_) => {
                    match serde_json::from_str::<Config>(&contents) {
                        Ok(config) => Ok(config),
                        Err(err) => Err(err.to_string())
                    }
                },
                Err(err) => Err(err.to_string())
            }
        },
        Err(err) => Err(err.to_string())
    }
}

#[tauri::command]
pub fn write_config(app_handle: AppHandle, config: Config) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();
    if !app_data_dir.exists() {
        if let Err(err) = fs::create_dir_all(&app_data_dir) {
            return Err(err.to_string())
        }
    }

    let config_dir = app_data_dir.join("config.json");

    match serde_json::to_string::<Config>(&config) {
        Ok(contents) => {
            match File::create(&config_dir) {
                Ok(mut file) => {
                    match file.write_all(&contents.as_bytes()) {
                        Ok(_) => Ok(()),
                        Err(err) => Err(err.to_string())
                    }
                },
                Err(err) => Err(err.to_string())
            }
        },
        Err(err) => Err(err.to_string())
    }
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
        match write_profiles(app_handle, vec![]) {
            Ok(_) => return Ok(vec![]),
            Err(err) => return Err(err)
        }
    }

    match File::open(&profile_dir) {
        Ok(mut file) => {
            let mut contents = String::new();
            match file.read_to_string(&mut contents) {
                Ok(_) => {
                    match serde_json::from_str::<Vec<Profile>>(&contents) {
                        Ok(profiles) => Ok(profiles),
                        Err(err) => Err(err.to_string())
                    }
                },
                Err(err) => Err(err.to_string())
            }
        },
        Err(err) => Err(err.to_string())
    }
}

#[tauri::command]
pub fn write_profiles(app_handle: AppHandle, profiles: Vec<Profile>) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let profile_dir = app_data_dir.join("profiles.json");
    if !profile_dir.exists() {
        if let Err(err) = fs::create_dir_all(&app_data_dir) {
            return Err(err.to_string());
        }
    }

    let profile_string = serde_json::to_string::<Vec<Profile>>(&profiles);
    match profile_string {
        Ok(profile) => {
            match File::create(&profile_dir) {
                Ok(mut file) => {
                    match file.write_all(&profile.as_bytes()) {
                        Ok(_) => Ok(()),
                        Err(err) => Err(err.to_string())
                    }
                },
                Err(err) => Err(err.to_string())
            }
        },
        Err(err) => Err(err.to_string())
    }
}

#[tauri::command]
pub fn create_environment(app_handle: AppHandle, id: String) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let environment_dir = app_data_dir.join("environments");
    let profile_dir = environment_dir.join(id);
    if let Err(err) = fs::create_dir_all(&profile_dir) {
        return Err(err.to_string());
    }

    // MacSploit - Documents
    let documents_dir = profile_dir.join("Documents");
    if let Err(err) = fs::create_dir_all(&documents_dir) {
        return Err(err.to_string());
    }

    // MacSploit - Downloads
    let downloads_dir = profile_dir.join("Downloads");
    if let Err(err) = fs::create_dir_all(&downloads_dir) {
        return Err(err.to_string());
    }

    // Roblox - Custom Assets
    let content_dir = profile_dir.join("Applications").join("Roblox.app").join("Contents").join("Resources").join("content");
    if let Err(err) = fs::create_dir_all(&content_dir) {
        return Err(err.to_string());
    }

    Ok(())
}

#[tauri::command]
pub fn remove_environment(app_handle: AppHandle, id: String) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let environment_dir = app_data_dir.join("environments");
    let profile_dir = environment_dir.join(id);
    if !profile_dir.exists() {
        if let Err(err) = fs::create_dir_all(&environment_dir) {
            return Err(err.to_string());
        }
        return Ok(());
    }

    if let Err(err) = fs::remove_dir_all(&profile_dir) {
        return Err(err.to_string());
    }

    // TODO: remove
    // com.roblox.RobloxPlayer.{profile_id} (folder)
    // com.roblox.RobloxPlayer.{profile_id}.binarycookies
    // from HTTPStorages folder
    Ok(())
}

#[tauri::command]
pub fn open_profile_folder(app_handle: AppHandle, id: String) -> Result<i32, String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let profile_dir = app_data_dir.join("environments").join(id);
    match fs::exists(&profile_dir) {
        Ok(exists) => {
            if !exists {
                return Err("Profile folder does not exist. Please delete and create a profile again.".into());
            }

            let child = Command::new("open")
                .args(&profile_dir.to_str())
                .spawn();

            match child {
                Ok(mut child) => {
                    let status = child.wait();
                    match status {
                        Ok(status) => {
                            if let Some(code) = status.code() {
                                Ok(code)
                            } else {
                                Ok(-1)
                            }
                        }
                        Err(err) => Err(err.to_string())
                    }
                }
                Err(err) => Err(err.to_string())
            }
        }
        Err(err) => Err(err.to_string())
    }
}
