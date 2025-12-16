use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::{fs, io::Read};
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
use std::process::Command;
use tauri::{AppHandle, Emitter, Manager};

#[derive(Clone, Serialize, Deserialize)]
pub struct InstallProgress {
    pub state: String,
    pub progress: Option<Vec<u64>>,
}

pub async fn download_package(
    app_handle: &AppHandle,
    url: &str,
    client: &str,
) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let clients_dir = app_data_dir.join("clients");
    if !clients_dir.exists() {
        fs::create_dir_all(&clients_dir).map_err(|e| e.to_string())?;
    }

    let client_dir = clients_dir.join(client.to_owned() + ".ipa");
    let mut file = File::create(&client_dir).map_err(|e| e.to_string())?;

    let client = Client::new();

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

    let mut downloaded = 0;
    while let Some(chunk) = response.chunk().await.map_err(|e| e.to_string())? {
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;
        if let Some(length) = response.content_length() {
            let _ = app_handle.emit_to("main", "install-progress", InstallProgress {
                state: "download-ipa".into(),
                progress: Some(vec![downloaded, length+downloaded]), // consumed + unconsumed = total size
            });
        }
    }

    Ok(())
}

pub async fn install_package(
    app_handle: &AppHandle,
    client: &str,
) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    let roblox_dir = app_data_dir
        .join("clients")
        .join(client.to_owned() + ".ipa");
    if !roblox_dir.exists() {
        return Err(format!("Package {} is not installed. An anti-virus software might be interrupting the installation process.", client));
    }

    let _ = app_handle.emit_to("main", "install-progress", InstallProgress {
        state: "install-ipa".into(),
        progress: None,
    });

    let mut child = Command::new("/usr/bin/unzip")
        .arg("-o")
        .arg("-q")
        .arg("-d")
        .arg(app_data_dir.join("clients"))
        .arg(&roblox_dir)
        .spawn()
        .map_err(|e| e.to_string())?;

    let status = child.wait().map_err(|e| e.to_string())?;
    if let Some(code) = status.code() {
        if code != 0 {
            return Err(format!(
                "Failed to unzip Package {} with code {}. Please try again after cleaning installation cache.",
                client, code
            ));
        }

        let app_dir = app_data_dir.join("clients").join("Payload").join("Roblox.app");

        let client_dir = app_data_dir
            .join("clients")
            .join(client.to_owned() + ".app");
        fs::rename(app_dir, &client_dir).map_err(|e| e.to_string())?;

        fs::remove_dir_all(app_data_dir.join("clients").join("Payload")).map_err(|e| e.to_string())?;

        let mut child = Command::new("/bin/chmod")
            .arg("+x")
            .arg(&client_dir.join("Roblox"))
            .spawn()
            .map_err(|e| e.to_string())?;

        let status = child.wait().map_err(|e| e.to_string())?;
        if let Some(code) = status.code() {
            if code != 0 {
                return Err(format!(
                    "Failed to install package with code {}.",
                    code
                ));
            }

            // Remove installation cache
            fs::remove_file(&roblox_dir).map_err(|e| e.to_string())?;

            Ok(())
        } else {
            Err("Failed to install package with code -1.".into())
        }
    } else {
        Err(format!("Failed to unzip Package {} with code -1.", client))
    }
}

pub async fn codesign(app_handle: &AppHandle, path: &PathBuf, sign: bool) -> Result<(), String> {
    let mut child;
    if sign {
        let _ = app_handle.emit_to("main", "install-progress", InstallProgress {
            state: "apply-codesign".into(),
            progress: None,
        });

        child = Command::new("/usr/bin/codesign")
            .arg("-s")
            .arg("-")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    } else {
        let _ = app_handle.emit_to("main", "install-progress", InstallProgress {
            state: "remove-codesign".into(),
            progress: None,
        });

        child = Command::new("/usr/bin/codesign")
            .arg("--remove-signature")
            .arg(&path)
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

pub async fn convert(app_handle: &AppHandle, path: &PathBuf) -> Result<(), String> {
    let _ = app_handle.emit_to("main", "install-progress", InstallProgress {
        state: "convert-ipa".into(),
        progress: None,
    });

    let mut child = Command::new("/usr/bin/vtool")
        .arg("-set-build-version")
        .arg("maccatalyst")
        .arg("13.0")
        .arg("18.2")
        .arg("-replace")
        .arg("-output")
        .arg(&path)
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;

    let status = child.wait().map_err(|e| e.to_string())?;
    if let Some(code) = status.code() {
        if code != 0 {
            return Err(format!("Failed to convert with code {}.", code));
        }

        Ok(())
    } else {
        Err("Failed to convert with code -1.".into())
    }
}

pub async fn convert_plist(app_handle: &AppHandle, path: &PathBuf) -> Result<(), String> {
    let _ = app_handle.emit_to("main", "install-progress", InstallProgress {
        state: "convert-ipa".into(),
        progress: None,
    });

    let mut child = Command::new("/usr/bin/plutil")
        .arg("-convert")
        .arg("xml1")
        .arg("-o")
        .arg(&path)
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;

    let status = child.wait().map_err(|e| e.to_string())?;
    if let Some(code) = status.code() {
        if code != 0 {
            return Err(format!("Failed to convert plist with code {}.", code));
        }

        Ok(())
    } else {
        Err("Failed to convert plist with code -1.".into())
    }
}

#[tauri::command]
pub async fn install_ipa(
    app_handle: AppHandle,
    client: String,
    version: String,
) -> Result<(), String> {
    let arch = std::env::consts::ARCH;
    if arch != "aarch64" {
        return Err("You cannot install this client. .ipa installations are only available on Apple Silicon.".into());
    }

    if client == "Delta" {
        download_package(&app_handle, format!("https://cdn.gloopup.net/file/Delta-{}.ipa", version).as_str(), &client)
            .await
            .map_err(|e| e.to_string())?;
    }

    install_package(&app_handle, &client)
        .await
        .map_err(|e| e.to_string())?;

    // remove codesign before converting
    let app_data_dir = app_handle.path().app_data_dir().unwrap();

    // Roblox.app
    let roblox_dir = app_data_dir
        .join("clients")
        .join(client.to_owned() + ".app");
    if !roblox_dir.exists() {
        return Err(format!("Package {} is not installed. An anti-virus software might be interrupting the installation process.", client));
    }
    codesign(&app_handle, &roblox_dir, false)
        .await
        .map_err(|e| e.to_string())?;

    // Roblox.app/Frameworks/Persona2.framework
    let persona_dir = app_data_dir
        .join("clients")
        .join(client.to_owned() + ".app")
        .join("Frameworks")
        .join("Persona2.framework");
    if !persona_dir.exists() {
        return Err(format!("Package {} is not installed. An anti-virus software might be interrupting the installation process.", client));
    }
    codesign(&app_handle, &persona_dir, false)
        .await
        .map_err(|e| e.to_string())?;

    // Roblox.app/Frameworks/RobloxLib.framework
    let robloxlib_dir = app_data_dir
        .join("clients")
        .join(client.to_owned() + ".app")
        .join("Frameworks")
        .join("RobloxLib.framework");
    if !robloxlib_dir.exists() {
        return Err(format!("Package {} is not installed. An anti-virus software might be interrupting the installation process.", client));
    }
    codesign(&app_handle, &robloxlib_dir, false)
        .await
        .map_err(|e| e.to_string())?;

    // convert into Mac Catalyst app
    // Roblox.app/Roblox
    convert(&app_handle, &roblox_dir.join("Roblox"))
        .await
        .map_err(|e| e.to_string())?;

    // Roblox.app/Frameworks/Persona2.framework/Persona2
    convert(&app_handle, &persona_dir.join("Persona2"))
        .await
        .map_err(|e| e.to_string())?;

    // Roblox.app/Frameworks/RobloxLib.framework/RobloxLib
    convert(&app_handle, &robloxlib_dir.join("RobloxLib"))
        .await
        .map_err(|e| e.to_string())?;

    if client == "Delta" {
        // Roblox.app/Frameworks/libgloop.dylib
        convert(&app_handle, &roblox_dir.join("Frameworks").join("libgloop.dylib"))
            .await
            .map_err(|e| e.to_string())?;
    }

    // convert bplist into xml plist for bundle identifier modification
    let plist_dir = roblox_dir.join("Info.plist");
    convert_plist(&app_handle, &plist_dir)
        .await
        .map_err(|e| e.to_string())?;

    // Modify bundle identifier to com.roblox.RobloxPlayer
    let mut file = File::open(&plist_dir).map_err(|e| e.to_string())?;

    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| e.to_string())?;

    contents = contents.replace(
        "com.gloop.deltamobile",
        "com.roblox.RobloxPlayer",
    ).to_string();

    let mut file = File::create(&plist_dir).map_err(|e| e.to_string())?;
    file.write_all(contents.as_bytes())
        .map_err(|e| e.to_string())?;

    // apply codesign after converting
    // Roblox.app
    codesign(&app_handle, &roblox_dir, true)
        .await
        .map_err(|e| e.to_string())?;

    // Roblox.app/Frameworks/Persona2.framework
    codesign(&app_handle, &persona_dir, true)
        .await
        .map_err(|e| e.to_string())?;

    // Roblox.app/Frameworks/RobloxLib.framework
    codesign(&app_handle, &robloxlib_dir, true)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
