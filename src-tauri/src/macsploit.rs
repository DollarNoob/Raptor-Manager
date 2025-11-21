use std::fs::{self, File};
use std::io::{BufRead, BufReader, Write};
use tauri::{AppHandle, Manager};
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct MacsploitSettings {
    pub autoExecute: bool,
    pub autoInject: bool,
    pub multiInstance: bool,
    pub executeInstances: bool,
    pub fileSystem: bool,
    pub debugLibrary: bool,
    pub httpTraffic: bool,
    pub settingsControl: bool,
    pub serverTeleports: bool,
    pub placeRestrictions: bool,
    pub dumpScripts: bool,
    pub logHttp: bool,
    pub compatibilityMode: bool,
    pub norbUnc: bool,
    pub resumeHandle: bool,
    pub robloxRpc: bool,
    pub discordRpc: bool,
    pub sandbox: bool,
}

#[tauri::command]
pub async fn macsploit_read_settings(app_handle: AppHandle, id: Option<String>) -> Result<MacsploitSettings, String> {
    // default settings
    let mut settings = MacsploitSettings {
        autoExecute: true,
		autoInject: false,
		multiInstance: false,
		executeInstances: false,
        fileSystem: true,
		debugLibrary: true,
		httpTraffic: true,
		settingsControl: true,
		serverTeleports: true,
		placeRestrictions: true,
		dumpScripts: false,
		logHttp: true,
		compatibilityMode: false,
		norbUnc: true,
		resumeHandle: false,
		robloxRpc: true,
		discordRpc: true,
		sandbox: false,
    };

    let settings_dir;
    if let Some(id) = id {
        let app_data_dir = app_handle.path().app_data_dir().unwrap();
        settings_dir = app_data_dir.join("environments").join(&id).join("Downloads").join("ms-settings");
    } else {
        let download_dir = app_handle.path().download_dir().unwrap();
        settings_dir = download_dir.join("ms-settings");
    }

    if !settings_dir.exists() {
        return Ok(settings);
    }

    let file = File::open(settings_dir).map_err(|e| e.to_string())?;
    let reader = BufReader::new(file);

    for setting in reader.lines() {
        let line = setting.map_err(|e| e.to_string())?;
        let mut parts = line.split_whitespace();

        let key;
        if let Some(item) = parts.next() {
            key = item;
        } else {
            continue;
        }

        let value;
        if let Some(item) = parts.next() {
            value = item == "true";
        } else {
            continue;
        }

        match key {
            "autoExecute"        => settings.autoExecute        = value,
            "autoInject"         => settings.autoInject         = value,
            "multiInstance"      => settings.multiInstance      = value,
            "executeInstances"   => settings.executeInstances   = value,
            "fileSystem"         => settings.fileSystem         = value,
            "debugLibrary"       => settings.debugLibrary       = value,
            "httpTraffic"        => settings.httpTraffic        = value,
            "settingsControl"    => settings.settingsControl    = value,
            "serverTeleports"    => settings.serverTeleports    = value,
            "placeRestrictions"  => settings.placeRestrictions  = value,
            "dumpScripts"        => settings.dumpScripts        = value,
            "logHttp"            => settings.logHttp            = value,
            "compatibilityMode"  => settings.compatibilityMode  = value,
            "norbUnc"            => settings.norbUnc            = value,
            "resumeHandle"       => settings.resumeHandle       = value,
            "robloxRpc"          => settings.robloxRpc          = value,
            "discordRpc"         => settings.discordRpc         = value,
            "sandbox"            => settings.sandbox            = value,
            _ => continue,
        }
    }

    Ok(settings)
}

#[tauri::command]
pub async fn macsploit_write_settings(app_handle: AppHandle, id: String, settings: MacsploitSettings) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let downloads_dir = app_data_dir.join("environments").join(&id).join("Downloads");
    if !downloads_dir.exists() {
        fs::create_dir_all(&downloads_dir).map_err(|e| e.to_string())?;
    }

    let settings_dir = downloads_dir.join("ms-settings");
    let mut file = File::create(settings_dir).map_err(|e| e.to_string())?;

    for (name, value) in [
        ("autoExecute", settings.autoExecute),
        ("autoInject", settings.autoInject),
        ("multiInstance", settings.multiInstance),
        ("executeInstances", settings.executeInstances),
        ("fileSystem", settings.fileSystem),
        ("debugLibrary", settings.debugLibrary),
        ("httpTraffic", settings.httpTraffic),
        ("settingsControl", settings.settingsControl),
        ("serverTeleports", settings.serverTeleports),
        ("placeRestrictions", settings.placeRestrictions),
        ("dumpScripts", settings.dumpScripts),
        ("logHttp", settings.logHttp),
        ("compatibilityMode", settings.compatibilityMode),
        ("norbUnc", settings.norbUnc),
        ("resumeHandle", settings.resumeHandle),
        ("robloxRpc", settings.robloxRpc),
        ("discordRpc", settings.discordRpc),
        ("sandbox", settings.sandbox),
    ] {
        file.write_all(format!("{} {}\n", name, value).as_bytes()).map_err(|e| e.to_string())?;
    }

    Ok(())
}
