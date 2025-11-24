import { Image } from "@tauri-apps/api/image";
import { resolveResource } from "@tauri-apps/api/path";

const iconCache: Record<string, Image> = {};

export async function useMenuIcon(path: string) {
    if (!iconCache[path]) {
        iconCache[path] = await Image.fromPath(
            await resolveResource("icons/" + path),
        );
    }
    return iconCache[path];
}
