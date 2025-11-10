use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::fmt::Debug;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct RobloxProfile {
    pub id: i64,
    pub name: String,
    pub displayName: String
}

#[tauri::command]
pub async fn get_roblox_profile(
    app_handle: AppHandle,
    cookie: String,
) -> Result<RobloxProfile, String> {
    let client = Client::new();
    let response = client
        .get("https://users.roblox.com/v1/users/authenticated")
        .header("Cookie", format!(".ROBLOSECURITY={}", cookie))
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

            let body = response.json().await;
            match body {
                Ok(profile) => Ok(profile),
                Err(err) => Err(err.to_string())
            }
        }
        Err(err) => Err(err.to_string()),
    }
}

#[derive(Debug, Deserialize)]
pub struct RobloxThumbnailData {
    data: Vec<RobloxThumbnail>
}

#[derive(Debug, Deserialize)]
#[allow(non_snake_case, dead_code)]
pub struct RobloxThumbnail {
    targetId: i64,
    state: String,
    imageUrl: String,
    version: String
}

#[tauri::command]
pub async fn get_roblox_thumbnail(app_handle: AppHandle, user_id: i64) -> Result<String, String> {
    let client = Client::new();
    let url = format!("https://thumbnails.roblox.com/v1/users/avatar-bust?userIds={}&size=420x420&format=Png&isCircular=false", user_id);
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

            let body: Result<RobloxThumbnailData, reqwest::Error> = response.json().await;
            match body {
                Ok(body) => {
                    if body.data.len() == 0 {
                        return Err("404 Not Found".into());
                    }

                    let profile = body.data.first().expect("profile does not exist");
                    if profile.state != "Completed" {
                        return Err(profile.state.clone());
                    }

                    Ok(profile.imageUrl.clone())
                }
                Err(err) => Err(err.to_string())
            }
        }
        Err(err) => Err(err.to_string()),
    }
}
