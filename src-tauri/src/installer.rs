use regex::Regex;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::fs;
use std::fs::File;
use std::io::Write;
use std::process::Command;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct RobloxVersion {
    pub version: String,
    pub clientVersionUpload: String,
    pub bootstrapperVersion: String,
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
            ),
        )
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = response.status();
    if !status.is_success() {
        return Err(status.to_string());
    }

    let body = response
        .json::<RobloxVersion>()
        .await
        .map_err(|e| e.to_string())?;
    Ok(body)
}

#[derive(Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct MacsploitVersion {
    pub clientVersionUpload: String,
    pub appVersion: String,
    pub clientVersion: String,
    pub relVersion: String,
    pub channel: String,
    pub changelog: String,
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
            ),
        )
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = response.status();
    if !status.is_success() {
        return Err(status.to_string());
    }

    let body = response
        .json::<MacsploitVersion>()
        .await
        .map_err(|e| e.to_string())?;
    Ok(body)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HydrogenVersion {
    pub global: GlobalVersion,
    pub windows: PlatformVersion,
    pub macos: PlatformVersion,
    pub ios: PlatformVersion,
    pub android: PlatformVersion,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GlobalVersion {
    pub globallogs: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlatformVersion {
    pub product: Option<String>,
    pub exploit_version: Option<String>,
    pub roblox_version: Option<String>,
    pub changelog: Option<String>,
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
            ),
        )
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = response.status();
    if !status.is_success() {
        return Err(status.to_string());
    }

    let body = response
        .json::<HydrogenVersion>()
        .await
        .map_err(|e| e.to_string())?;
    Ok(body)
}

pub async fn download_roblox(app_handle: &AppHandle, version: &str) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let clients_dir = app_data_dir.join("clients");
    if !clients_dir.exists() {
        fs::create_dir_all(&clients_dir).map_err(|e| e.to_string())?;
    }

    let client_dir = clients_dir.join(version.to_owned() + ".zip");
    if !client_dir.exists() {
        let mut file = File::create(&client_dir).map_err(|e| e.to_string())?;

        let client = Client::new();
        let url;
        if std::env::consts::ARCH == "aarch64" {
            url = format!(
                "https://setup.rbxcdn.com/mac/arm64/{}-RobloxPlayer.zip",
                version
            );
        } else {
            url = format!("https://setup.rbxcdn.com/mac/{}-RobloxPlayer.zip", version);
        }

        let mut response = client
            .get(url)
            .header(
                "User-Agent",
                format!(
                    "RaptorManager/{}",
                    app_handle.package_info().version.to_string()
                ),
            )
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let status = response.status();
        if !status.is_success() {
            return Err(status.to_string());
        }

        while let Some(chunk) = response.chunk().await.map_err(|e| e.to_string())? {
            file.write_all(&chunk).map_err(|e| e.to_string())?;
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
                ),
            )
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let status = response.status();
        if !status.is_success() {
            return Err(status.to_string());
        }

        let bytes = response.bytes().await.map_err(|e| e.to_string())?;

        let mut file = File::create(&insert_dylib_dir).map_err(|e| e.to_string())?;
        file.write_all(&bytes).map_err(|e| e.to_string())?;
    }

    let mut child = Command::new("/bin/chmod")
        .arg("+x")
        .arg(insert_dylib_dir)
        .spawn()
        .map_err(|e| e.to_string())?;

    let status = child.wait().map_err(|e| e.to_string())?;
    if let Some(code) = status.code() {
        if code != 0 {
            return Err(format!(
                "Failed to install insert_dylib with code {}.",
                code
            ));
        }

        Ok(())
    } else {
        Err("Failed to install insert_dylib with code -1.".into())
    }
}

pub async fn install_roblox(
    app_handle: &AppHandle,
    client: &str,
    version: &str,
) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let roblox_dir = app_data_dir
        .join("clients")
        .join(version.to_owned() + ".zip");
    if !roblox_dir.exists() {
        return Err(format!("Roblox {} is not installed. An anti-virus software might be interrupting the installation process.", version));
    }

    let mut child = Command::new("/usr/bin/unzip")
        .arg("-o")
        .arg("-q")
        .arg("-d")
        .arg(app_data_dir.join("clients"))
        .arg(roblox_dir)
        .spawn()
        .map_err(|e| e.to_string())?;

    let status = child.wait().map_err(|e| e.to_string())?;
    if let Some(code) = status.code() {
        if code != 0 {
            return Err(format!(
                "Failed to unzip Roblox {} with code {}.",
                version, code
            ));
        }

        let robloxplayer_dir = app_data_dir.join("clients").join("RobloxPlayer.app");

        let executable_dir = robloxplayer_dir.join("Contents").join("MacOS");
        let roblox_app_dir = executable_dir.join("Roblox.app");
        fs::remove_dir_all(roblox_app_dir).map_err(|e| e.to_string())?;

        let roblox_installer_dir = executable_dir.join("RobloxPlayerInstaller.app");
        fs::remove_dir_all(roblox_installer_dir).map_err(|e| e.to_string())?;

        let client_dir = app_data_dir
            .join("clients")
            .join(client.to_owned() + ".app");
        fs::rename(robloxplayer_dir, client_dir).map_err(|e| e.to_string())?;

        Ok(())
    } else {
        Err(format!("Failed to unzip Roblox {} with code -1.", version))
    }
}

pub async fn download_dylib(app_handle: &AppHandle, client: &str) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let client_dir = app_data_dir
        .join("clients")
        .join(client.to_owned() + ".app");
    let dylib_dir = client_dir
        .join("Contents")
        .join("MacOS")
        .join(client.to_owned().to_lowercase() + ".dylib");
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
                    ),
                )
                .send()
                .await
                .map_err(|e| e.to_string())?;

            let status = response.status();
            if !status.is_success() {
                return Err(status.to_string());
            }

            let bytes = response.bytes().await.map_err(|e| e.to_string())?;

            let mut file = File::create(&dylib_dir).map_err(|e| e.to_string())?;
            file.write_all(&bytes).map_err(|e| e.to_string())?;
        } else if client == "Hydrogen" || client == "Ronix" {
            // Because Hydrogen dylib is located inside its app, we have to download the app and take the dylib.

            // First, fetch the install script.
            let reqwest_client = Client::new();
            let url: String;
            if client == "Hydrogen" {
                url = "https://www.hydrogen.lat/install".into();
            } else if client == "Ronix" {
                url = "https://www.ronixmac.lol/install".into();
            } else {
                // will not happen
                url = "".into();
            }
            let response = reqwest_client
                .get(url)
                .header(
                    "User-Agent",
                    format!(
                        "RaptorManager/{}",
                        app_handle.package_info().version.to_string()
                    ),
                )
                .send()
                .await
                .map_err(|e| e.to_string())?;

            let status = response.status();
            if !status.is_success() {
                return Err(status.to_string());
            }

            let body = response.text().await.map_err(|e| e.to_string())?;

            // Second, parse Hydrogen.zip download url.
            let regex = Regex::new(
                format!(
                    r#"{}_M_URL="(https:\/\/\w+\.ufs\.sh\/f\/\w+)""#,
                    client.to_uppercase()
                )
                .as_str(),
            )
            .unwrap();
            if let Some(capture) = regex.captures(&body) {
                let hydrogen_zip_dir = app_data_dir.join(client.to_owned() + ".zip");
                let hydrogen_dir = app_data_dir.join(client.to_owned() + ".app");

                // Third, download Hydrogen.zip.
                let mut file = File::create(&hydrogen_zip_dir).map_err(|e| e.to_string())?;

                let mut response = reqwest_client
                    .get(&capture[1])
                    .header(
                        "User-Agent",
                        format!(
                            "RaptorManager/{}",
                            app_handle.package_info().version.to_string()
                        ),
                    )
                    .send()
                    .await
                    .map_err(|e| e.to_string())?;

                let status = response.status();
                if !status.is_success() {
                    return Err(status.to_string());
                }

                while let Some(chunk) = response.chunk().await.map_err(|err| err.to_string())? {
                    file.write_all(&chunk).map_err(|e| e.to_string())?;
                }

                // Fourth, unzip Hydrogen.zip. This will create Hydrogen.app.
                let mut child = Command::new("/usr/bin/unzip")
                    .arg("-o")
                    .arg("-q")
                    .arg("-d")
                    .arg(&app_data_dir)
                    .arg(&hydrogen_zip_dir)
                    .spawn()
                    .map_err(|e| e.to_string())?;

                let status = child.wait().map_err(|e| e.to_string())?;
                if let Some(code) = status.code() {
                    if code != 0 {
                        return Err(format!("Failed to unzip {} with code {}.", client, code));
                    }

                    if !hydrogen_dir.exists() {
                        return Err(format!(
                            "Failed to download {}.app, application does not exist.",
                            client
                        ));
                    }

                    fs::remove_file(&hydrogen_zip_dir).map_err(|e| e.to_string())?;

                    // Finally, take Hydrogen dylib file from the app.
                    let executable_dir = hydrogen_dir.join("Contents").join("MacOS");
                    let hydrogen_dylib_dir;
                    if std::env::consts::ARCH == "aarch64" {
                        hydrogen_dylib_dir = executable_dir.join(client.to_owned() + "-arm.dylib");
                    } else {
                        hydrogen_dylib_dir =
                            executable_dir.join(client.to_owned() + "-intel.dylib");
                    }

                    fs::rename(hydrogen_dylib_dir, dylib_dir).map_err(|e| e.to_string())?;

                    fs::remove_dir_all(&hydrogen_dir).map_err(|e| e.to_string())?;

                    return Ok(());
                } else {
                    return Err(format!("Failed to unzip {} with code -1.", client));
                }
            } else {
                return Err(format!("Failed to fetch {}.zip download URL.", client));
            }
        }
    }

    Ok(())
}

pub async fn insert_dylib(app_handle: &AppHandle, client: &str) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let roblox_dir = app_data_dir
        .join("clients")
        .join(client.to_owned() + ".app");
    if !roblox_dir.exists() {
        return Err("Client is not installed. An anti-virus software might be interrupting the installation process.".into());
    }

    let insert_dylib_dir = app_data_dir.join("insert_dylib");
    let executable_dir = roblox_dir.join("Contents").join("MacOS");
    let dylib_dir = executable_dir.join(client.to_owned().to_lowercase() + ".dylib");
    let player_dir = executable_dir.join("RobloxPlayer");

    let mut child = Command::new(insert_dylib_dir)
        .arg(dylib_dir)
        .arg(&player_dir)
        .arg(&player_dir)
        .arg("--overwrite")
        .arg("--strip-codesig")
        .arg("--all-yes")
        .spawn()
        .map_err(|e| e.to_string())?;

    let status = child.wait().map_err(|e| e.to_string())?;
    if let Some(code) = status.code() {
        if code != 0 {
            return Err(format!("Failed to insert dylib with code {}.", code));
        }

        Ok(())
    } else {
        Err("Failed to insert dylib with code -1.".into())
    }
}

pub async fn codesign(app_handle: &AppHandle, client: &str, sign: bool) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let roblox_dir = app_data_dir
        .join("clients")
        .join(client.to_owned() + ".app");
    if !roblox_dir.exists() {
        return Err("Client is not installed. An anti-virus software might be interrupting the installation process.".into());
    }

    let mut child;
    if sign {
        child = Command::new("/usr/bin/codesign")
            .arg("-s")
            .arg("-")
            .arg(&roblox_dir)
            .spawn()
            .map_err(|e| e.to_string())?;
    } else {
        child = Command::new("/usr/bin/codesign")
            .arg("--remove-signature")
            .arg(&roblox_dir)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    let status = child.wait().map_err(|e| e.to_string())?;
    if let Some(code) = status.code() {
        if code != 0 {
            return Err(format!("Failed to codesign with code {}.", code));
        }

        Ok(())
    } else {
        Err("Failed to codesign with code -1.".into())
    }
}

#[tauri::command]
pub async fn install_client(
    app_handle: AppHandle,
    client: String,
    version: String,
) -> Result<(), String> {
    download_roblox(&app_handle, &version)
        .await
        .map_err(|e| e.to_string())?;

    if client != "Vanilla" {
        install_insert_dylib(&app_handle)
            .await
            .map_err(|e| e.to_string())?;
    }

    install_roblox(&app_handle, &client, &version)
        .await
        .map_err(|e| e.to_string())?;

    if client != "Vanilla" {
        download_dylib(&app_handle, &client)
            .await
            .map_err(|e| e.to_string())?;
    }

    // remove codesign in arm64
    if std::env::consts::ARCH == "aarch64" {
        codesign(&app_handle, &client, false)
            .await
            .map_err(|e| e.to_string())?;
    }

    if client != "Vanilla" {
        insert_dylib(&app_handle, &client)
            .await
            .map_err(|e| e.to_string())?;
    }

    // add codesign in arm64
    if std::env::consts::ARCH == "aarch64" {
        codesign(&app_handle, &client, true)
            .await
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub async fn remove_client(app_handle: AppHandle, client: String) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let client_dir = app_data_dir.join("clients").join(client + ".app");
    if !client_dir.exists() {
        return Ok(());
    }

    fs::remove_dir_all(&client_dir).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn clean_cache(app_handle: AppHandle) -> Result<u64, String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let clients_dir = app_data_dir.join("clients");
    if !clients_dir.exists() {
        return Ok(0);
    }

    let mut cleaned_bytes = 0;
    for entry in fs::read_dir(&clients_dir).map_err(|e| e.to_string())? {
        let e = entry.map_err(|e| e.to_string())?;
        if !e.file_name().to_str().unwrap().ends_with(".app") {
            let metadata = e.metadata().unwrap();
            if metadata.is_dir() {
                fs::remove_dir_all(e.path()).map_err(|e| e.to_string())?;
            } else if metadata.is_file() {
                fs::remove_file(e.path()).map_err(|e| e.to_string())?;
            }
            cleaned_bytes += metadata.len();
        }
    }

    Ok(cleaned_bytes)
}
