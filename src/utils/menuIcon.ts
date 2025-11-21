import { Image } from "@tauri-apps/api/image";

const iconCache: Record<string, Image> = {};

export async function useMenuIcon(path: string) {
    if (!iconCache[path]) {
        iconCache[path] = await Image.fromPath("icons/" + path);
    }
    return iconCache[path];
}
