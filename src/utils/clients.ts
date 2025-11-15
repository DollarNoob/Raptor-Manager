import { invoke } from "@tauri-apps/api/core";
import { useConfigStore, useStore, useVersionStore } from "../store";
import { updateProfile } from "./profiles";

export async function launchClient(
    client: string,
    profileId: string,
    cookie: string,
) {
    const store = useStore.getState();

    const profile = store.profiles.find(p => p.id === profileId);
    if (!profile)
        throw new Error(
            "Profile not found. Please try again."
        );

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

    const launched = await invoke("launch_client", {
        client,
        profileId,
    }).catch((err) => new Error(err));
    if (launched instanceof Error) throw launched;

    const newProfile = {
        ...profile,
        lastPlayedAt: Date.now(),
    };

    await updateProfile(newProfile);

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

    const written = await import("./config").then(({ writeConfig }) =>
        writeConfig(newConfig),
    );
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

    await import("./config").then(({ writeConfig }) => writeConfig(newConfig));
}
