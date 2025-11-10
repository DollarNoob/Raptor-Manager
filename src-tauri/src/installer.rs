use std::{fs::{self, File}, io::Write, process::Command};

use regex::Regex;
use reqwest::Client;
use serde::{Serialize, Deserialize};
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct RobloxVersion {
    pub version: String,
    pub clientVersionUpload: String,
    pub bootstrapperVersion: String
}

#[tauri::command]
pub async fn get_roblox_version(app_handle: AppHandle) -> Result<RobloxVersion, String> {
    let client = Client::new();
    let url = format!("https://clientsettingscdn.roblox.com/v2/client-version/MacPlayer");
    let response = client
        .get(url)
        .header(
            "User-Agent",
            format!(
                "RaptorManager/{}",
                app_handle.package_info().version.to_string()
            )
        )
        .send()
        .await;

    match response {
        Ok(response) => {
            let status = response.status();
            if !status.is_success() {
                return Err(status.to_string());
            }

            let body: Result<RobloxVersion, reqwest::Error> = response.json().await;
            match body {
                Ok(body) => Ok(body),
                Err(err) => Err(err.to_string())
            }
        }
        Err(err) => Err(err.to_string())
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct MacsploitVersion {
    pub clientVersionUpload: String,
    pub appVersion: String,
    pub clientVersion: String,
    pub relVersion: String,
    pub channel: String,
    pub changelog: String
}

#[tauri::command]
pub async fn get_macsploit_version(app_handle: AppHandle) -> Result<MacsploitVersion, String> {
    let client = Client::new();
    let url = format!("https://www.abyssdigital.xyz/main/version.json");
    let response = client
        .get(url)
        .header(
            "User-Agent",
            format!(
                "RaptorManager/{}",
                app_handle.package_info().version.to_string()
            )
        )
        .send()
        .await;

    match response {
        Ok(response) => {
            let status = response.status();
            if !status.is_success() {
                return Err(status.to_string());
            }

            let body: Result<MacsploitVersion, reqwest::Error> = response.json().await;
            match body {
                Ok(body) => Ok(body),
                Err(err) => Err(err.to_string())
            }
        }
        Err(err) => Err(err.to_string())
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HydrogenVersion {
    pub global: GlobalVersion,
    pub windows: PlatformVersion,
    pub macos: PlatformVersion,
    pub ios: PlatformVersion,
    pub android: PlatformVersion
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GlobalVersion {
    pub globallogs: String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlatformVersion {
    pub product: Option<String>,
    pub exploit_version: Option<String>,
    pub roblox_version: Option<String>,
    pub changelog: Option<String>
}

#[tauri::command]
pub async fn get_hydrogen_version(app_handle: AppHandle) -> Result<HydrogenVersion, String> {
    let client = Client::new();
    let url = format!("https://hydrogen.lat/updates.json");
    let response = client
        .get(url)
        .header(
            "User-Agent",
            format!(
                "RaptorManager/{}",
                app_handle.package_info().version.to_string()
            )
        )
        .send()
        .await;

    match response {
        Ok(response) => {
            let status = response.status();
            if !status.is_success() {
                return Err(status.to_string());
            }

            let body: Result<HydrogenVersion, reqwest::Error> = response.json().await;
            match body {
                Ok(body) => Ok(body),
                Err(err) => Err(err.to_string())
            }
        }
        Err(err) => Err(err.to_string())
    }
}

pub async fn download_roblox(app_handle: &AppHandle, version: &str) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let clients_dir = app_data_dir.join("clients");
    if !clients_dir.exists() {
        if let Err(err) = fs::create_dir_all(&clients_dir) {
            return Err(err.to_string());
        }
    }

    let client_dir = clients_dir.join(version.to_owned() + ".zip");
    if !client_dir.exists() {
        match File::create(&client_dir) {
            Ok(mut file) => {
                let client = Client::new();

                let url;
                if std::env::consts::ARCH == "aarch64" {
                    url = format!("https://setup.rbxcdn.com/mac/arm64/{}-RobloxPlayer.zip", version);
                } else {
                    url = format!("https://setup.rbxcdn.com/mac/{}-RobloxPlayer.zip", version);
                }

                let response = client
                    .get(url)
                    .header(
                        "User-Agent",
                        format!(
                            "RaptorManager/{}",
                            app_handle.package_info().version.to_string()
                        )
                    )
                    .send()
                    .await;

                match response {
                    Ok(mut response) => {
                        let status = response.status();
                        if !status.is_success() {
                            return Err(status.to_string());
                        }

                        while let Some(chunk) = response.chunk().await.map_err(|err| err.to_string())? {
                            if let Err(err) = file.write_all(&chunk) {
                                return Err(err.to_string());
                            }
                        }
                    },
                    Err(err) => return Err(err.to_string())
                }
            },
            Err(err) => return Err(err.to_string())
        }
    }

    Ok(())
}

pub async fn install_insert_dylib(app_handle: &AppHandle) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let insert_dylib_dir = app_data_dir.join("insert_dylib");
    if !insert_dylib_dir.exists() {
        let client = Client::new();

        let response = client
            .get("https://github.com/DollarNoob/Macsploit-Mirror/raw/main/insert_dylib")
            .header(
                "User-Agent",
                format!(
                    "RaptorManager/{}",
                    app_handle.package_info().version.to_string()
                )
            )
            .send()
            .await;

        match response {
            Ok(response) => {
                let status = response.status();
                if !status.is_success() {
                    return Err(status.to_string());
                }

                match response.bytes().await {
                    Ok(bytes) => {
                        match File::create(&insert_dylib_dir) {
                            Ok(mut file) => {
                                if let Err(err) = file.write_all(&bytes) {
                                    return Err(err.to_string());
                                }
                            },
                            Err(err) => return Err(err.to_string())
                        }
                    },
                    Err(err) => return Err(err.to_string())
                }
            },
            Err(err) => return Err(err.to_string())
        }
    }

    let child = Command::new("/bin/chmod")
        .arg("+x")
        .arg(insert_dylib_dir)
        .spawn();

    match child {
        Ok(mut child) => {
            let status = child.wait();
            match status {
                Ok(status) => {
                    if let Some(code) = status.code() {
                        if code != 0 {
                            return Err(format!("Failed to install insert_dylib with code {}.", code));
                        }

                        Ok(())
                    } else {
                        Err("Failed to install insert_dylib.".into())
                    }
                }
                Err(err) => Err(err.to_string())
            }
        }
        Err(err) => Err(err.to_string())
    }
}

pub async fn install_roblox(app_handle: &AppHandle, client: &str, version: &str) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let roblox_dir = app_data_dir.join("clients").join(version.to_owned() + ".zip");
    if !roblox_dir.exists() {
        return Err(format!("Roblox {} is not installed. This is unexpected.", version));
    }

    let child = Command::new("/usr/bin/unzip")
        .arg("-o")
        .arg("-q")
        .arg("-d")
        .arg(app_data_dir.join("clients"))
        .arg(roblox_dir)
        .spawn();

    match child {
        Ok(mut child) => {
            let status = child.wait();
            match status {
                Ok(status) => {
                    if let Some(code) = status.code() {
                        if code != 0 {
                            return Err(format!("Failed to unzip Roblox {} with code {}.", version, code));
                        }

                        let robloxplayer_dir = app_data_dir.join("clients").join("RobloxPlayer.app");

                        let executable_dir = robloxplayer_dir.join("Contents").join("MacOS");
                        let roblox_app_dir = executable_dir.join("Roblox.app");
                        if let Err(err) = fs::remove_dir_all(roblox_app_dir) {
                            return Err(err.to_string());
                        }

                        let roblox_installer_dir = executable_dir.join("RobloxPlayerInstaller.app");
                        if let Err(err) = fs::remove_dir_all(roblox_installer_dir) {
                            return Err(err.to_string());
                        }

                        let client_dir = app_data_dir.join("clients").join(client.to_owned() + ".app");
                        if let Err(err) = fs::rename(robloxplayer_dir, client_dir) {
                            return Err(err.to_string());
                        }

                        Ok(())
                    } else {
                        Err(format!("Failed to unzip Roblox {}.", version))
                    }
                }
                Err(err) => Err(err.to_string())
            }
        }
        Err(err) => Err(err.to_string())
    }
}

// I am the true nesting god
pub async fn download_dylib(app_handle: &AppHandle, client: &str) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let client_dir = app_data_dir.join("clients").join(client.to_owned() + ".app");
    let dylib_dir = client_dir.join("Contents").join("MacOS").join(client.to_owned().to_lowercase() + ".dylib");
    if !dylib_dir.exists() {
        if client == "MacSploit" {
            let url;
            if std::env::consts::ARCH == "aarch64" {
                url = "https://abyssdigital.xyz/arm/macsploit.dylib";
            } else {
                url = "https://abyssdigital.xyz/main/macsploit.dylib";
            }

            let client = Client::new();
            let response = client
                .get(url)
                .header(
                    "User-Agent",
                    format!(
                        "RaptorManager/{}",
                        app_handle.package_info().version.to_string()
                    )
                )
                .send()
                .await;

            match response {
                Ok(response) => {
                    let status = response.status();
                    if !status.is_success() {
                        return Err(status.to_string());
                    }

                    match response.bytes().await {
                        Ok(bytes) => {
                            match File::create(&dylib_dir) {
                                Ok(mut file) => {
                                    if let Err(err) = file.write_all(&bytes) {
                                        return Err(err.to_string());
                                    }
                                },
                                Err(err) => return Err(err.to_string())
                            }
                        },
                        Err(err) => return Err(err.to_string())
                    }
                },
                Err(err) => return Err(err.to_string())
            }
        } else if client == "Hydrogen" {
            let c = Client::new();
            let response = c
                .get("https://www.hydrogen.lat/install")
                .header(
                    "User-Agent",
                    format!(
                        "RaptorManager/{}",
                        app_handle.package_info().version.to_string()
                    )
                )
                .send()
                .await;

            match response {
                Ok(response) => {
                    let status = response.status();
                    if !status.is_success() {
                        return Err(status.to_string());
                    }

                    match response.text().await {
                        Ok(body) => {
                            let regex = Regex::new(r#"HYDROGEN_M_URL="(https:\/\/\w+\.ufs\.sh\/f\/\w+)""#).unwrap();

                            if let Some(capture) = regex.captures(&body) {
                                let hydrogen_zip_dir = app_data_dir.join(client.to_owned() + ".zip");
                                let hydrogen_dir = app_data_dir.join(client.to_owned() + ".app");
                                match File::create(&hydrogen_zip_dir) {
                                    Ok(mut file) => {
                                        let response = c
                                            .get(&capture[1])
                                            .header(
                                                "User-Agent",
                                                format!(
                                                    "RaptorManager/{}",
                                                    app_handle.package_info().version.to_string()
                                                )
                                            )
                                            .send()
                                            .await;

                                        match response {
                                            Ok(mut response) => {
                                                let status = response.status();
                                                if !status.is_success() {
                                                    return Err(status.to_string());
                                                }

                                                while let Some(chunk) = response.chunk().await.map_err(|err| err.to_string())? {
                                                    if let Err(err) = file.write_all(&chunk) {
                                                        return Err(err.to_string());
                                                    }
                                                }

                                                let child = Command::new("/usr/bin/unzip")
                                                    .arg("-o")
                                                    .arg("-q")
                                                    .arg("-d")
                                                    .arg(&app_data_dir)
                                                    .arg(&hydrogen_zip_dir)
                                                    .spawn();

                                                match child {
                                                    Ok(mut child) => {
                                                        let status = child.wait();
                                                        match status {
                                                            Ok(status) => {
                                                                if let Some(code) = status.code() {
                                                                    if code != 0 {
                                                                        return Err(format!("Failed to unzip Hydrogen with code {}.", code));
                                                                    }

                                                                    if !hydrogen_dir.exists() {
                                                                        return Err("Failed to download Hydrogen, application does not exist.".into());
                                                                    }

                                                                    if let Err(err) = fs::remove_file(&hydrogen_zip_dir) {
                                                                        return Err(err.to_string());
                                                                    }

                                                                    let executable_dir = hydrogen_dir.join("Contents").join("MacOS");
                                                                    let hydrogen_dylib_dir;
                                                                    if std::env::consts::ARCH == "aarch64" {
                                                                        hydrogen_dylib_dir = executable_dir.join("Hydrogen-arm.dylib");
                                                                    } else {
                                                                        hydrogen_dylib_dir = executable_dir.join("Hydrogen-intel.dylib");
                                                                    }

                                                                    if let Err(err) = fs::rename(hydrogen_dylib_dir, dylib_dir) {
                                                                        return Err(err.to_string());
                                                                    }

                                                                    if let Err(err) = fs::remove_dir_all(&hydrogen_dir) {
                                                                        return Err(err.to_string());
                                                                    }

                                                                    return Ok(());
                                                                } else {
                                                                    return Err("Failed to unzip Hydrogen.".into());
                                                                }
                                                            }
                                                            Err(err) => return Err(err.to_string())
                                                        }
                                                    }
                                                    Err(err) => return Err(err.to_string())
                                                }
                                            },
                                            Err(err) => return Err(err.to_string())
                                        }
                                    },
                                    Err(err) => return Err(err.to_string())
                                }
                            }
                        },
                        Err(err) => return Err(err.to_string())
                    }
                },
                Err(err) => return Err(err.to_string())
            }
        }
    }
    Ok(())
}

pub async fn insert_dylib(app_handle: &AppHandle, client: &str) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let roblox_dir = app_data_dir.join("clients").join(client.to_owned() + ".app");
    if !roblox_dir.exists() {
        return Err("Client is not installed. This is unexpected.".into());
    }

    let insert_dylib_dir = app_data_dir.join("insert_dylib");
    let executable_dir = roblox_dir.join("Contents").join("MacOS");
    let dylib_dir = executable_dir.join(client.to_owned().to_lowercase() + ".dylib");
    let player_dir = executable_dir.join("RobloxPlayer");
    let child = Command::new(insert_dylib_dir)
        .arg(dylib_dir)
        .arg(&player_dir)
        .arg(&player_dir)
        .arg("--overwrite")
        .arg("--strip-codesig")
        .arg("--all-yes")
        .spawn();

    match child {
        Ok(mut child) => {
            let status = child.wait();
            match status {
                Ok(status) => {
                    if let Some(code) = status.code() {
                        if code != 0 {
                            return Err(format!("Failed to insert dylib with code {}.", code));
                        }
                        Ok(())
                    } else {
                        Err("Failed to insert dylib.".into())
                    }
                }
                Err(err) => Err(err.to_string())
            }
        }
        Err(err) => Err(err.to_string())
    }
}

pub async fn codesign(app_handle: &AppHandle, client: &str, sign: bool) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let roblox_dir = app_data_dir.join("clients").join(client.to_owned() + ".app");
    if !roblox_dir.exists() {
        return Err("Client is not installed. This is unexpected.".into());
    }

    let child;
    if sign {
        child = Command::new("/usr/bin/codesign")
            .arg("-s")
            .arg("-")
            .arg(&roblox_dir)
            .spawn();
    } else {
        child = Command::new("/usr/bin/codesign")
            .arg("--remove-signature")
            .arg(&roblox_dir)
            .spawn();
    }

    match child {
        Ok(mut child) => {
            let status = child.wait();
            match status {
                Ok(status) => {
                    if let Some(code) = status.code() {
                        if code != 0 {
                            return Err(format!("Failed to codesign with code {}.", code));
                        }

                        Ok(())
                    } else {
                        Err("Failed to codesign.".into())
                    }
                }
                Err(err) => Err(err.to_string())
            }
        }
        Err(err) => Err(err.to_string())
    }
}

#[tauri::command]
pub async fn install_client(app_handle: AppHandle, client: String, version: String) -> Result<(), String> {
    if let Err(err) = download_roblox(&app_handle, &version).await {
        return Err(err);
    }

    if client != "Vanilla" {
        if let Err(err) = install_insert_dylib(&app_handle).await {
            return Err(err);
        }
    }

    if let Err(err) = install_roblox(&app_handle, &client, &version).await {
        return Err(err);
    }

    if client != "Vanilla" {
        if let Err(err) = download_dylib(&app_handle, &client).await {
            return Err(err);
        }

        // remove codesign in arm64
        if std::env::consts::ARCH == "aarch64" {
            if let Err(err) = codesign(&app_handle, &client, false).await {
                return Err(err);
            }
        }

        if let Err(err) = insert_dylib(&app_handle, &client).await {
            return Err(err);
        }

        // add codesign in arm64
        if std::env::consts::ARCH == "aarch64" {
            if let Err(err) = codesign(&app_handle, &client, true).await {
                return Err(err);
            }
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn remove_client(app_handle: AppHandle, client: String) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let client_dir = app_data_dir.join("clients").join(client + ".app");
    if !client_dir.exists() {
        return Ok(())
    }

    match fs::remove_dir_all(&client_dir) {
        Ok(_) => Ok(()),
        Err(err) => Err(err.to_string())
    }
}
