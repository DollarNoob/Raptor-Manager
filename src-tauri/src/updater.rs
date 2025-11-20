use tauri_plugin_updater::UpdaterExt;

pub async fn check_update(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let updater = app.updater().map_err(|e| e.to_string())?;
    if let Some(update) = updater.check().await.map_err(|e| e.to_string())? {
        println!("update current version: {:#?}", update.current_version);
        println!("update download url: {:#?}", update.download_url);
        println!("update raw json: {:#?}", update.raw_json);
        println!("update signature: {:#?}", update.signature);
        println!("update target: {:#?}", update.target);
        println!("update version: {:#?}", update.version);

        return Ok(Some(update.version));
    }

    Ok(None)
}

#[tauri::command]
pub async fn update(app: tauri::AppHandle) -> Result<(), String> {
    let updater = app.updater().map_err(|e| e.to_string())?;
    if let Some(update) = updater.check().await.map_err(|e| e.to_string())? {
        println!("update current version: {:#?}", update.current_version);
        println!("update download url: {:#?}", update.download_url);
        println!("update raw json: {:#?}", update.raw_json);
        println!("update signature: {:#?}", update.signature);
        println!("update target: {:#?}", update.target);
        println!("update version: {:#?}", update.version);

        update
            .download_and_install(|_, _| {}, || {})
            .await
            .map_err(|e| e.to_string())?;

        println!("update installed");
        app.restart();
    }

    Ok(())
}
