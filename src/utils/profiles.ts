import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../store";
import type { IProfile } from "../types/profile";
import { showConfirmationModal, showErrorModal } from "./modal";

/**
 * Adds a new profile to the store and creates its environment and keychain.
 * @param profile - The profile object to add
 */
export async function addProfile(profile: IProfile) {
    const store = useStore.getState();

    const added = await invoke<void>("write_profiles", {
        profiles: [...store.profiles, profile],
    }).catch((err: string) => new Error(err));
    if (added instanceof Error) {
        showErrorModal("Failed to write profile", added.message);
        return;
    }

    const envCreated = await invoke<void>("create_environment", {
        id: profile.id,
    }).catch((err) => new Error(err));
    if (envCreated instanceof Error) {
        showErrorModal("Failed to create environment", envCreated.message);
        return;
    }

    const keychain = await invoke<number>("create_keychain", {
        profileId: profile.id,
    }).catch((err) => new Error(err));
    if (keychain instanceof Error) {
        showErrorModal("Failed to create Keychain", keychain.message);
        return;
    }
    if (keychain !== 0) {
        showErrorModal(
            "Failed to create keychain",
            `Could not create keychain with code ${keychain}.`,
        );
        return;
    }

    store.addProfile(profile);
}

/**
 * Updates an existing profile in the store.
 * @param profile - The updated profile object
 */
export async function updateProfile(profile: IProfile) {
    const store = useStore.getState();

    const newProfiles = store.profiles.map((p) =>
        p.id === profile.id ? profile : p,
    );
    const updated = await invoke<void>("write_profiles", {
        profiles: newProfiles,
    }).catch((err: string) => new Error(err));
    if (updated instanceof Error) {
        showErrorModal("Failed to write profile", updated.message);
        return;
    }

    store.updateProfile(profile);
}

/**
 * Removes a profile from the store and deletes its environment.
 * @param id - The ID of the profile to remove
 */
export async function removeProfile(id: string) {
    const store = useStore.getState();
    const removed = await invoke<void>("write_profiles", {
        profiles: store.profiles.filter((p) => p.id !== id),
    }).catch((err: string) => new Error(err));
    if (removed instanceof Error) throw removed;

    const envRemoved = await invoke<void>("remove_environment", { id }).catch(
        (err: string) => new Error(err),
    );
    if (envRemoved instanceof Error) throw envRemoved;

    store.removeProfile(id);
}

/**
 * Reads all profiles from storage and adds them to the store.
 * Tries to fetch thumbnails if they aren't ready
 * @returns True if successful, false otherwise
 */
export async function readProfiles() {
    const profiles = await invoke<IProfile[]>("read_profiles").catch(
        (err) => new Error(err),
    );

    if (profiles instanceof Error) {
        showConfirmationModal(
            "Failed to read profiles",
            `${profiles.message} Would you like to reset profiles?`,
            () => {},
        );
        return false;
    }

    const store = useStore.getState();
    for (const profile of profiles) {
        if (store.profiles.some((p) => p.id === profile.id)) continue;
        store.addProfile(profile);

        // Retry thumbnail if it does not exist
        if (!profile.thumbnail) {
            (async () => {
                const robloxThumbnail = await invoke<string | null>("get_roblox_thumbnail", {
                    userId: profile.userId,
                }).catch((err) => new Error(err));
                if (robloxThumbnail instanceof Error) return;
                if (!robloxThumbnail) return;

                const newProfile: IProfile = {
                    ...profile,
                    thumbnail: robloxThumbnail.split("/")[3],
                };

                await updateProfile(newProfile);
            })();
        }
    }

    return true;
}
