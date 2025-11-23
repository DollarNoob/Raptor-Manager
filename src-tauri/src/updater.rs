use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Url};
use tauri_plugin_updater::UpdaterExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Update {
    pub current_version: String,
    pub version: String,
    pub date: Option<i64>,
    pub target: String,
    pub download_url: Url,
    pub signature: String,
    pub notes: Option<String>,
}

pub async fn check_update(app_handle: AppHandle) -> Result<Option<Update>, String> {
    let updater = app_handle.updater().map_err(|e| e.to_string())?;
    if let Some(update) = updater.check().await.map_err(|e| e.to_string())? {
        let mut update_date = None;
        if let Some(date) = update.date {
            update_date = Some(date.unix_timestamp() * 1000);
        }

        let update_notes = update.raw_json.get("notes").map(|note| note.to_string());

        return Ok(Some(Update {
            current_version: update.current_version,
            version: update.version,
            date: update_date,
            target: update.target,
            download_url: update.download_url,
            signature: update.signature,
            notes: update_notes,
        }));
    }

    Ok(None)
}

#[tauri::command]
pub async fn update(app_handle: AppHandle) -> Result<(), String> {
    let updater = app_handle.updater().map_err(|e| e.to_string())?;
    if let Some(update) = updater.check().await.map_err(|e| e.to_string())? {
        println!("update current version: {:#?}", update.current_version);
        println!("update download url: {:#?}", update.download_url);
        println!("update raw json: {:#?}", update.raw_json);
        println!("update signature: {:#?}", update.signature);
        println!("update target: {:#?}", update.target);
        println!("update version: {:#?}", update.version);

        let mut downloaded = 0;
        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded += chunk_length as u64;
                    if let Some(length) = content_length {
                        let _ = app_handle.emit_to("main", "update-progress", [downloaded, length]);
                    }
                },
                || {
                    let _ = app_handle.emit_to("main", "update-finish", ());
                },
            )
            .await
            .map_err(|e| e.to_string())?;

        app_handle.restart();
    }

    Ok(())
}
