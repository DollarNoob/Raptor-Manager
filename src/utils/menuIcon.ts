import { Image } from "@tauri-apps/api/image";
import { resolveResource } from "@tauri-apps/api/path";

const iconCache: Record<string, Image> = {};

/**
 * Loads and caches a menu icon from the icons directory.
 * Returns a cached version if the icon was already loaded.
 * @param path - The filename of the icon to load
 * @returns The loaded image object
 */
export async function useMenuIcon(path: string) {
    if (!iconCache[path]) {
        iconCache[path] = await Image.fromPath(
            await resolveResource("icons/" + path),
        );
    }
    return iconCache[path];
}
