use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

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

#[derive(Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct CrypticVersion {
    pub Platform: String,
    pub Versions: CrypticVersions,
    pub Changelog: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct CrypticVersions {
    pub Software: String,
    pub Roblox: String,
}

#[tauri::command]
pub async fn get_cryptic_version(app_handle: AppHandle) -> Result<CrypticVersion, String> {
    let client = Client::new();
    let url = format!(
        "https://raw.githubusercontent.com/RSDTestAccount/Endpoints/main/Cryptic-Mac-Internal"
    );
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
        .json::<CrypticVersion>()
        .await
        .map_err(|e| e.to_string())?;
    Ok(body)
}
