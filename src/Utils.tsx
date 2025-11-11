import { invoke } from "@tauri-apps/api/core";
import {
    isPermissionGranted,
    requestPermission,
    sendNotification,
} from "@tauri-apps/plugin-notification";
import {
    useConfigStore,
    useModalStore,
    useStore,
    useVersionStore,
} from "./store";
import type { IProfile } from "./types/profile";
import type { IState } from "./types/state";
import type { IConfig } from "./types/config";
import type {
    IRobloxVersion,
    IMacsploitVersion,
    IHydrogenVersion,
} from "./types/version";

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

export async function launchClient(
    client: string,
    profileId: string,
    cookie: string,
) {
    const unlocked = await invoke<number>("unlock_keychain", {
        profileId,
    }).catch((err) => new Error(err));
    if (unlocked instanceof Error) throw unlocked;

    if (unlocked === 50)
        throw new Error(
            "Keychain was not found. It seems like your profile is corrupted, please remove the profile and create it again.",
        );
    else if (unlocked !== 0)
        throw new Error(`Could not unlock keychain with code ${unlocked}.`);

    const written = await invoke<null>("write_cookies", {
        profileId,
        cookie,
    }).catch((err) => new Error(err));
    if (written instanceof Error) throw written;

    const modified = await invoke<null>("modify_bundle_identifier", {
        client,
        profileId,
    }).catch((err) => new Error(err));
    if (modified instanceof Error) throw modified;

    const launched = await invoke<IState>("launch_client", {
        client,
        profileId,
    }).catch((err) => new Error(err));
    if (launched instanceof Error) throw launched;

    return launched;
}

export async function stopClient(pid: number) {
    const stopped = await invoke("stop_client", { pid }).catch(
        (err) => new Error(err),
    );
    if (stopped instanceof Error) throw stopped;
    if (!stopped)
        throw new Error("Client could not be stopped due to an unknown error.");
}

export async function readConfig() {
    const cfg = await invoke<IConfig>("read_config").catch(
        (err) => new Error(err),
    );

    if (cfg instanceof Error) {
        const modal = useModalStore.getState();
        const id = crypto.randomUUID();
        modal.add({
            id,
            title: "Failed to read config",
            text: `${cfg.message} Would you like to reset the config?`,
            buttons: [
                {
                    text: "No",
                    onClick: () => modal.remove(id),
                },
                {
                    text: "Yes",
                    onClick: () =>
                        modal.remove(id) ??
                        writeConfig({
                            client: null,
                            clients: [],
                            decompiler: "medal",
                        }),
                },
            ],
        });
        return false;
    }

    useConfigStore.getState().setConfig(cfg);
    return true;
}

export async function writeConfig(config: IConfig) {
    useConfigStore.getState().setConfig(config);

    const cfg = await invoke<IConfig>("write_config", { config }).catch(
        (err) => new Error(err),
    );

    if (cfg instanceof Error) {
        const modal = useModalStore.getState();
        const id = crypto.randomUUID();
        modal.add({
            id,
            title: "Failed to write config",
            text: cfg.message,
            buttons: [
                {
                    text: "Okay",
                    onClick: () => modal.remove(id),
                },
            ],
        });
        return false;
    }
    return true;
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

export async function fetchClientVersions() {
    const version = useVersionStore.getState();

    const robloxPromise = invoke<IRobloxVersion>("get_roblox_version").catch(
        (err) => new Error(err),
    );
    const macsploitPromise = invoke<IMacsploitVersion>(
        "get_macsploit_version",
    ).catch((err) => new Error(err));
    const hydrogenPromise = invoke<IHydrogenVersion>(
        "get_hydrogen_version",
    ).catch((err) => new Error(err));

    const [roblox, macsploit, hydrogen] = await Promise.all([
        robloxPromise,
        macsploitPromise,
        hydrogenPromise,
    ]);

    if (roblox instanceof Error) {
        const modal = useModalStore.getState();
        const id = crypto.randomUUID();
        modal.add({
            id,
            title: "Failed to fetch Roblox version",
            text: roblox.message,
            buttons: [
                {
                    text: "Okay",
                    onClick: () => modal.remove(id),
                },
            ],
        });
        return false;
    }
    version.setRoblox(roblox);

    if (macsploit instanceof Error) {
        const modal = useModalStore.getState();
        const id = crypto.randomUUID();
        modal.add({
            id,
            title: "Failed to fetch MacSploit version",
            text: macsploit.message,
            buttons: [
                {
                    text: "Okay",
                    onClick: () => modal.remove(id),
                },
            ],
        });
        return false;
    }
    version.setMacsploit(macsploit);

    if (hydrogen instanceof Error) {
        const modal = useModalStore.getState();
        const id = crypto.randomUUID();
        modal.add({
            id,
            title: "Failed to fetch Hydrogen version",
            text: hydrogen.message,
            buttons: [
                {
                    text: "Okay",
                    onClick: () => modal.remove(id),
                },
            ],
        });
        return false;
    }
    version.setHydrogen(hydrogen);

    return true;
}

export async function installClient(client: string) {
    const version = useVersionStore.getState();

    let clientVersion = version.roblox.clientVersionUpload;
    let dylibVersion = version.roblox.version;
    if (client === "Vanilla") {
        if (!clientVersion)
            throw new Error("Roblox version is not fetched yet.");
        if (!dylibVersion) throw new Error("Dylib version is not fetched yet.");
    } else if (client === "MacSploit") {
        if (
            !version.macsploit.clientVersionUpload ||
            !version.macsploit.relVersion
        )
            throw new Error("MacSploit version is not fetched yet.");

        clientVersion = version.macsploit.clientVersionUpload;
        dylibVersion = version.macsploit.relVersion;
    } else if (client === "Hydrogen") {
        if (
            !version.hydrogen.macos.roblox_version ||
            !version.hydrogen.macos.exploit_version
        )
            throw new Error("Hydrogen version is not fetched yet.");

        clientVersion = version.hydrogen.macos.roblox_version;
        dylibVersion = version.hydrogen.macos.exploit_version;
    }

    const installed = await invoke("install_client", {
        client,
        version: clientVersion,
    }).catch((err: string) => new Error(err));
    if (installed instanceof Error) throw installed;

    const config = useConfigStore.getState();
    const newConfig = {
        ...config.config,
        clients: [
            ...config.config.clients,
            {
                name: client,
                version: dylibVersion,
            },
        ],
    };

    const written = await writeConfig(newConfig);
    if (written) config.setConfig(newConfig);

    return;
}

export async function removeClient(client: string) {
    const installed = await invoke("remove_client", { client }).catch(
        (err: string) => new Error(err),
    );
    if (installed instanceof Error) throw installed;

    const config = useConfigStore.getState();
    const newConfig = {
        ...config.config,
        client: config.config.client === client ? null : config.config.client,
        clients: config.config.clients.filter((c) => c.name !== client),
    };
    config.setConfig(newConfig);

    await writeConfig(newConfig);
}

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
