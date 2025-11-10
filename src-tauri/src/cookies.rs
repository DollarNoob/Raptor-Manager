use std::fs::File;
use std::io::Write;
use std::thread;
use std::time::{Duration, SystemTime};
use crate::binarycookies::{BinaryCookies, Cookie, Page};
use tauri::{AppHandle, Emitter, Manager, WebviewWindowBuilder};

#[tauri::command]
pub fn read_cookies() -> Result<(), String> {
    // not used, use import cookies instead
    // let data =
    //     fs::read("~/Desktop/manager/com.roblox.RobloxPlayer.binarycookies")
    //         .expect("read file");
    // let bc = BinaryCookies::parse(&data).expect("parse");
    // println!("Pages: {}", bc.pages.len());
    // for (i, page) in bc.pages.iter().enumerate() {
    //     println!("Page {}: {} cookies", i, page.cookies.len());
    //     for c in &page.cookies {
    //         println!(
    //             "{}={} domain={} path={:?} secure={} httponly={}",
    //             c.name, c.value, c.domain, c.path, c.secure, c.http_only
    //         );
    //     }
    // }
    Ok(())
}

#[tauri::command]
pub async fn write_cookies(app_handle: AppHandle, profile_id: String, cookie: String) -> Result<(), String> {
    let file_dir = app_handle.path().data_dir().unwrap().parent().unwrap().join("HTTPStorages").join(format!("com.roblox.RobloxPlayer.{}.binarycookies", profile_id));

    let cookie = Cookie {
        domain: ".roblox.com".into(),
        name: ".ROBLOSECURITY".into(),
        path: Some("/".into()),
        value: cookie,
        secure: true,
        http_only: true,
        expiration: Some(SystemTime::now() + Duration::from_secs(60 * 60 * 24 * 30)),
        creation: Some(SystemTime::now())
    };

    let page = Page::new(vec![cookie]);

    let bytes = BinaryCookies::build(&[page]);

    match File::create(&file_dir) {
        Ok(mut file) => {
            match file.write_all(&bytes) {
                Ok(_) => Ok(()),
                Err(err) => Err(err.to_string())
            }
        },
        Err(err) => Err(err.to_string())
    }
}

#[tauri::command]
pub fn import_cookies(app_handle: AppHandle) -> Result<(), String> {
    let webview = WebviewWindowBuilder::new(
        &app_handle,
        "login",
        tauri::WebviewUrl::App("https://www.roblox.com/login".into())
    )
        .title("Roblox")
        .inner_size(640.0, 720.0)
        .resizable(false)
        .build();

    match webview {
        Ok(webview) => {
            if let Err(err) = webview.clear_all_browsing_data() {
                return Err(err.to_string());
            }

            let app_handle_poll = app_handle.clone();
            thread::spawn(move || {
                let roblox_url = tauri::Url::parse("https://roblox.com/").unwrap();
                loop {
                    match webview.cookies_for_url(roblox_url.clone()) {
                        Ok(cookies) => {
                            for cookie in cookies {
                                if cookie.name() == ".ROBLOSECURITY" {
                                    let _ = app_handle_poll.emit_to("main", "import_cookies", cookie.value());
                                    let _ = webview.close();
                                    break;
                                }
                            }
                            thread::sleep(Duration::from_secs(1));
                        },
                        Err(_) => break
                    }
                }
            });

            Ok(())
        },
        Err(err) => Err(err.to_string())
    }
}
