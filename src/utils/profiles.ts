import { invoke } from "@tauri-apps/api/core";
import { useModalStore, useStore } from "../store";
import type { IProfile } from "../types/profile";

export async function addProfile(profile: IProfile) {
    const store = useStore.getState();
    const modal = useModalStore.getState();

    const added = await invoke<void>("write_profiles", {
        profiles: [...store.profiles, profile],
    }).catch((err: string) => new Error(err));
    if (added instanceof Error) {
        const _id = crypto.randomUUID();
        modal.add({
            id: _id,
            title: "Failed to write profile",
            text: added.message,
            buttons: [
                {
                    text: "Okay",
                    onClick: () => modal.remove(_id),
                },
            ],
        });
        return;
    }

    const envCreated = await invoke<void>("create_environment", {
        id: profile.id,
    }).catch((err) => new Error(err));
    if (envCreated instanceof Error) {
        const _id = crypto.randomUUID();
        modal.add({
            id: _id,
            title: "Failed to create environment",
            text: envCreated.message,
            buttons: [
                {
                    text: "Okay",
                    onClick: () => modal.remove(_id),
                },
            ],
        });
        return;
    }

    const keychain = await invoke<number>("create_keychain", {
        profileId: profile.id,
    }).catch((err) => new Error(err));
    if (keychain instanceof Error) {
        const _id = crypto.randomUUID();
        modal.add({
            id: _id,
            title: "Failed to create Keychain",
            text: keychain.message,
            buttons: [
                {
                    text: "Okay",
                    onClick: () => modal.remove(_id),
                },
            ],
        });
        return;
    }
    if (keychain !== 0) {
        const _id = crypto.randomUUID();
        modal.add({
            id: _id,
            title: "Failed to create keychain",
            text: `Could not create keychain with code ${keychain}.`,
            buttons: [
                {
                    text: "Okay",
                    onClick: () => modal.remove(_id),
                },
            ],
        });
        return;
    }

    store.addProfile(profile);
}

export async function updateProfile(profile: IProfile) {
    const store = useStore.getState();
    const modal = useModalStore.getState();

    const newProfiles = store.profiles.map((p) =>
        p.id === profile.id ? profile : p,
    );
    const updated = await invoke<void>("write_profiles", {
        profiles: newProfiles,
    }).catch((err: string) => new Error(err));
    if (updated instanceof Error) {
        const _id = crypto.randomUUID();
        modal.add({
            id: _id,
            title: "Failed to write profile",
            text: updated.message,
            buttons: [
                {
                    text: "Okay",
                    onClick: () => modal.remove(_id),
                },
            ],
        });
        return;
    }

    store.updateProfile(profile);
}

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

export async function readProfiles() {
    const profiles = await invoke<IProfile[]>("read_profiles").catch(
        (err) => new Error(err),
    );

    if (profiles instanceof Error) {
        const modal = useModalStore.getState();
        const id = crypto.randomUUID();
        modal.add({
            id,
            title: "Failed to read profiles",
            text: `${profiles.message} Would you like to reset profiles?`,
            buttons: [
                {
                    text: "No",
                    onClick: () => modal.remove(id),
                },
                {
                    text: "Yes",
                    onClick: () => modal.remove(id),
                },
            ],
        });
        return false;
    }

    const store = useStore.getState();
    for (const profile of profiles) {
        if (store.profiles.some((p) => p.id === profile.id)) continue;
        store.addProfile(profile);
    }

    return true;
}
