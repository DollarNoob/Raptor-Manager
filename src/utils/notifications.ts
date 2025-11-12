import {
    isPermissionGranted,
    requestPermission,
    sendNotification,
} from "@tauri-apps/plugin-notification";

export async function notify() {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === "granted";
    }

    if (permissionGranted) {
        sendNotification({
            title: "New Image",
            body: "Check out this picture",
            // attachments: [
            //   {
            //     id: 'image-1',
            //     url: 'asset:///notification-image.jpg',
            //   },
            // ]
        });
        return true;
    }
    return false;
}
