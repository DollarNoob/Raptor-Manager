use regex::Regex;
use serde::Serialize;
use std::fmt::Debug;
use std::fs::File;
use std::io::{Read, Write};
use std::process::{Command, Stdio};
use std::thread;
use tauri::{AppHandle, Emitter, Manager};

#[tauri::command]
pub async fn create_keychain(app_handle: AppHandle, profile_id: String) -> Result<i32, String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();
    let profile_dir = app_data_dir.join("environments").join(&profile_id);

    let mut child = Command::new("/usr/bin/security")
        .arg("create-keychain")
        .arg("-p")
        .arg("")
        .arg("login.keychain")
        .env("HOME", profile_dir)
        .spawn()
        .map_err(|e| e.to_string())?;

    let status = child.wait().map_err(|e| e.to_string())?;
    if let Some(code) = status.code() {
        Ok(code)
    } else {
        Ok(-1)
    }
}

#[tauri::command]
pub async fn unlock_keychain(app_handle: AppHandle, profile_id: String) -> Result<i32, String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();
    let profile_dir = app_data_dir.join("environments").join(&profile_id);

    let mut child = Command::new("/usr/bin/security")
        .arg("unlock-keychain")
        .arg("-p")
        .arg("")
        .arg("login.keychain")
        .env("HOME", profile_dir)
        .spawn()
        .map_err(|e| e.to_string())?;

    let status = child.wait().map_err(|e| e.to_string())?;
    if let Some(code) = status.code() {
        Ok(code)
    } else {
        Ok(-1)
    }
}

#[tauri::command]
pub async fn modify_bundle_identifier(
    app_handle: AppHandle,
    client: String,
    profile_id: Option<String>,
) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let app_dir = app_data_dir.join("clients").join(client.clone() + ".app");
    if !app_dir.exists() {
        return Err("Selected client is not installed.".into());
    }
    let plist_dir = app_dir.join("Contents").join("Info.plist");

    let mut file = File::open(&plist_dir).map_err(|e| e.to_string())?;

    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| e.to_string())?;

    let identifier_regex =
        Regex::new(r"<string>com\.roblox\.RobloxPlayer\.?\w*<\/string>").unwrap();
    if let Some(id) = profile_id {
        contents = identifier_regex
            .replace(
                &contents,
                format!("<string>com.roblox.RobloxPlayer.{}</string>", id),
            )
            .to_string();
    } else {
        contents = identifier_regex
            .replace(&contents, "<string>com.roblox.RobloxPlayer</string>")
            .to_string();
    }

    let mut file = File::create(&plist_dir).map_err(|e| e.to_string())?;
    file.write_all(contents.as_bytes())
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct State {
    pub profile_id: String,
    pub connected: bool,
    pub pid: u32,
    pub client: Option<String>,
    pub port: Option<u16>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CloseState {
    pub profile_id: String,
    pub pid: u32,
    pub exit_code: i32,
}

#[tauri::command]
pub async fn launch_client(
    app_handle: AppHandle,
    client: String,
    profile_id: String,
) -> Result<State, String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let app_dir = app_data_dir.join("clients").join(client.clone() + ".app");
    if !app_dir.exists() {
        return Err("Selected client is not installed.".into());
    }
    let player_dir = app_dir.join("Contents").join("MacOS").join("RobloxPlayer");

    let profile_dir = app_data_dir.join("environments").join(&profile_id);

    let mut child = Command::new(player_dir)
        .env("HOME", profile_dir)
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| e.to_string())?;

    let pid = child.id();

    let stdout = child.stdout.take().unwrap();
    let profile_id_stdout = profile_id.clone();
    let app_handle_stdout = app_handle.clone();
    thread::spawn(move || {
        use std::io::{BufRead, BufReader};
        for line in BufReader::new(stdout).lines().flatten() {
            if line.starts_with("[IPC] Listening to TCP ") {
                let port = line
                    .replace("[IPC] Listening to TCP ", "")
                    .replace(".", "")
                    .parse::<u16>()
                    .unwrap();
                let _ = app_handle_stdout.emit_to(
                    "main",
                    "client_open",
                    State {
                        profile_id: profile_id_stdout.clone(),
                        connected: true,
                        pid: pid,
                        client: Some("MacSploit".into()),
                        port: Some(port),
                    },
                );
            } else if line.starts_with("Listening on localhost:") {
                let port = line
                    .replace("Listening on localhost:", "")
                    .parse::<u16>()
                    .unwrap();
                let _ = app_handle_stdout.emit_to(
                    "main",
                    "client_open",
                    State {
                        profile_id: profile_id_stdout.clone(),
                        connected: true,
                        pid: pid,
                        client: Some(client.clone()),
                        port: Some(port),
                    },
                );
            }
        }
    });

    let profile_id_wait = profile_id.clone();
    let app_handle_wait = app_handle.clone();
    thread::spawn(move || match child.wait() {
        Ok(status) => {
            let exit_code = status.code().unwrap_or(-1);
            let _ = app_handle_wait.emit_to(
                "main",
                "client_close",
                CloseState {
                    profile_id: profile_id_wait.clone(),
                    pid: pid,
                    exit_code: exit_code,
                },
            );
        }
        Err(_) => {
            let _ = app_handle_wait.emit_to(
                "main",
                "client_close",
                CloseState {
                    profile_id: profile_id_wait.clone(),
                    pid: pid,
                    exit_code: -2,
                },
            );
        }
    });

    Ok(State {
        profile_id: profile_id,
        connected: false,
        pid: pid,
        client: None,
        port: None,
    })
}

#[tauri::command]
pub async fn stop_client(pid: i32) -> Result<bool, String> {
    let status = Command::new("kill")
        .arg("-KILL")
        .arg(pid.to_string())
        .status()
        .map_err(|e| e.to_string())?;

    Ok(status.success())
}
