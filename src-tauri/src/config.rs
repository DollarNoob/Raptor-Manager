use serde::{Deserialize, Serialize};
use std::{
    fs::{self, File},
    io::{Read, Write},
    process::Command,
    vec,
};
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub client: Option<String>,
    pub clients: Vec<Client>,
    pub decompiler: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Client {
    pub name: String,
    pub version: String,
}

#[tauri::command]
pub fn read_config(app_handle: AppHandle) -> Result<Config, String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let config_dir = app_data_dir.join("config.json");
    if !config_dir.exists() {
        let default_config = Config {
            client: None,
            clients: vec![],
            decompiler: "medal".into(),
        };
        write_config(app_handle, default_config.clone()).map_err(|e| e.to_string())?;
        return Ok(default_config);
    }

    let mut file = File::open(&config_dir).map_err(|e| e.to_string())?;

    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| e.to_string())?;

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
    file.write_all(&contents.as_bytes())
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn update_decompiler(
    state: tauri::State<'_, crate::decompiler::AppState>,
    decompiler: String,
) -> Result<(), ()> {
    let mut decom_config = state.decompiler.lock().await;
    *decom_config = decompiler;
    Ok(())
}

#[tauri::command]
pub async fn update_hydrobridge(
    state: tauri::State<'_, crate::hydrobridge::AppState>,
    id: String,
) -> Result<(), ()> {
    let mut profile_id = state.id.lock().await;
    *profile_id = id;
    Ok(())
}

#[tauri::command]
pub async fn update_crypticbridge(
    state: tauri::State<'_, crate::crypticbridge::AppState>,
    id: String,
) -> Result<(), ()> {
    let mut profile_id = state.id.lock().await;
    *profile_id = id;
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
    pub lastPlayedAt: u64,
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
    file.read_to_string(&mut contents)
        .map_err(|e| e.to_string())?;

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
    file.write_all(&profile.as_bytes())
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn create_environment(app_handle: AppHandle, id: String) -> Result<(), String> {
    let init_script = format!(
        "-- Raptor Manager Init Script; DO NOT TOUCH!

getgenv().decompile = function(script)
    return request({{
        Url = 'http://localhost:6767/decompile',
        Method = 'POST',
        Body = getscriptbytecode(script)
    }}).Body
end

local executor = identifyexecutor()
if executor == 'Hydrogen' or executor == 'Ronix' or executor == 'Cryptic Mac' then
    local port = 6969 -- Hydrogen
    if executor == 'Cryptic Mac' then
        port = 5200
    end

    task.defer(function()
        local HttpService = game:GetService('HttpService')
        while task.wait(1) do
            local response = game:HttpGet('http://localhost:' .. port .. '/queue/{}')
            local ok, queue = pcall(function()
                return HttpService:JSONDecode(queue)
            end)
            if not ok then continue end

            for i, v in pairs(queue) do
                local func, err = loadstring(v)
                if func then
                    task.defer(func)
                else
                    task.spawn(error, err)
                end
            end
        end
    end)
end",
        &id
    );

    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let profile_dir = app_data_dir.join("environments").join(id);
    fs::create_dir_all(&profile_dir).map_err(|e| e.to_string())?;

    // MacSploit - Documents
    let documents_dir = profile_dir.join("Documents");
    fs::create_dir_all(&documents_dir).map_err(|e| e.to_string())?;

    // MacSploit - Automatic Execution
    let macsploit_autoexe_dir = documents_dir.join("Macsploit Automatic Execution");
    fs::create_dir_all(&macsploit_autoexe_dir).map_err(|e| e.to_string())?;

    // MacSploit - Init Script
    let mut file = File::create(&macsploit_autoexe_dir.join("RaptorManager.lua"))
        .map_err(|e| e.to_string())?;
    file.write_all(&init_script.as_bytes())
        .map_err(|e| e.to_string())?;

    // MacSploit - Downloads
    let downloads_dir = profile_dir.join("Downloads");
    fs::create_dir_all(&downloads_dir).map_err(|e| e.to_string())?;

    // Hydrogen
    let hydrogen_dir = profile_dir.join("Hydrogen");
    fs::create_dir_all(&hydrogen_dir).map_err(|e| e.to_string())?;

    // Hydrogen - Automatic Execution
    let hydrogen_autoexe_dir = hydrogen_dir.join("autoexecute");
    fs::create_dir_all(&hydrogen_autoexe_dir).map_err(|e| e.to_string())?;

    // Hydrogen - Init Script
    let mut file =
        File::create(&hydrogen_autoexe_dir.join("RaptorManager.lua")).map_err(|e| e.to_string())?;
    file.write_all(&init_script.as_bytes())
        .map_err(|e| e.to_string())?;

    // Ronix
    let ronix_dir = profile_dir.join("Ronix");
    fs::create_dir_all(&ronix_dir).map_err(|e| e.to_string())?;

    // Ronix - Automatic Execution
    let ronix_autoexe_dir = ronix_dir.join("autoexecute");
    fs::create_dir_all(&ronix_autoexe_dir).map_err(|e| e.to_string())?;

    // Ronix - Init Script
    let mut file =
        File::create(&ronix_autoexe_dir.join("RaptorManager.lua")).map_err(|e| e.to_string())?;
    file.write_all(&init_script.as_bytes())
        .map_err(|e| e.to_string())?;

    // Cryptic - Library
    let library_dir = profile_dir.join("Library");
    fs::create_dir_all(&library_dir).map_err(|e| e.to_string())?;

    // Cryptic - Caches
    let caches_dir = library_dir.join("Caches");
    fs::create_dir_all(&caches_dir).map_err(|e| e.to_string())?;

    // Cryptic - Automatic Execution
    let cryptic_autoexe_dir = caches_dir.join("CrypticMacAutoExec");
    fs::create_dir_all(&cryptic_autoexe_dir).map_err(|e| e.to_string())?;

    // Cryptic - Init Script
    let mut file =
        File::create(&cryptic_autoexe_dir.join("RaptorManager.lua")).map_err(|e| e.to_string())?;
    file.write_all(&init_script.as_bytes())
        .map_err(|e| e.to_string())?;

    // Roblox - Custom Assets
    let content_dir = profile_dir
        .join("Applications")
        .join("Roblox.app")
        .join("Contents")
        .join("Resources")
        .join("content");
    fs::create_dir_all(&content_dir).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn remove_environment(app_handle: AppHandle, id: String) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let environment_dir = app_data_dir.join("environments");
    if !environment_dir.exists() {
        fs::create_dir_all(&environment_dir).map_err(|e| e.to_string())?;
        return Ok(());
    }

    let profile_dir = environment_dir.join(&id);
    if profile_dir.exists() {
        fs::remove_dir_all(&profile_dir).map_err(|e| e.to_string())?;
    }

    let data_dir = app_handle.path().data_dir().unwrap();
    let library_dir = data_dir.parent().unwrap(); // $HOME/Library
    let http_storages_dir = library_dir.join("HTTPStorages");
    let caches_dir = library_dir.join("Caches");
    let preferences_dir = library_dir.join("Preferences");
    let webkit_dir = library_dir.join("WebKit");

    // Clear HTTPStorages
    let storage_dir = http_storages_dir.join(format!("com.roblox.RobloxPlayer.{}", &id));
    if storage_dir.exists() {
        fs::remove_dir_all(&storage_dir).map_err(|e| e.to_string())?;
    }

    let binary_cookie_dir = http_storages_dir.join(format!("com.roblox.RobloxPlayer.{}.binarycookies", &id));
    if binary_cookie_dir.exists() {
        fs::remove_file(&binary_cookie_dir).map_err(|e| e.to_string())?;
    }

    // Clean Caches
    let cache_dir = caches_dir.join(format!("com.roblox.RobloxPlayer.{}", &id));
    if cache_dir.exists() {
        fs::remove_dir_all(&cache_dir).map_err(|e| e.to_string())?;
    }

    // Clean Preferences
    let preference_dir = preferences_dir.join(format!("com.roblox.RobloxPlayer.{}.plist", &id));
    if preference_dir.exists() {
        fs::remove_file(&preference_dir).map_err(|e| e.to_string())?;
    }

    // Clean WebKit
    let webdata_dir = webkit_dir.join(format!("com.roblox.RobloxPlayer.{}", &id));
    if webdata_dir.exists() {
        fs::remove_dir_all(&webdata_dir).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn open_profile_folder(app_handle: AppHandle, id: String) -> Result<i32, String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let profile_dir = app_data_dir.join("environments").join(id);
    let exists = fs::exists(&profile_dir).map_err(|e| e.to_string())?;
    if !exists {
        return Err(
            "Profile folder does not exist. Please delete and create a profile again.".into(),
        );
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
