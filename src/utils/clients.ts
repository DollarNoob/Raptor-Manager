import { invoke } from "@tauri-apps/api/core";
import {
    CLIENT_NAME_CRYPTIC,
    CLIENT_NAME_DELTA,
    CLIENT_NAME_HYDROGEN,
    CLIENT_NAME_MACSPLOIT,
    CLIENT_NAME_OPIUMWARE,
    CLIENT_NAME_RONIX,
    CLIENT_NAME_VANILLA,
} from "../constants";
import { useConfigStore, useStore, useVersionStore } from "../store";
import { updateProfile } from "./profiles";

/**
 * Launches a client for a profile with the given cookie.
 * Unlocks keychain, writes cookies, modifies bundle identifier, and starts the client.
 * @param client - The client name to launch
 * @param profileId - The ID of the profile to launch
 * @param cookie - The cookie for the profile
 * @returns The launch result with state information
 */
export async function launchClient(
    client: string,
    profileId: string,
    cookie: string,
) {
    const store = useStore.getState();

    const profile = store.profiles.find((p) => p.id === profileId);
    if (!profile) throw new Error("Profile not found. Please try again.");

    if (client !== CLIENT_NAME_DELTA) {
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
    }

    if (client !== CLIENT_NAME_DELTA) {
        const created = await invoke<null>("create_environment", {
            id: profileId,
        }).catch((err) => new Error(err));
        if (created instanceof Error) throw created;
    } else {
        // Sandboxed (~/Library/Containers/{identifier})
        const created = await invoke<null>("create_sandboxed_environment", {
            id: profileId,
        }).catch((err) => new Error(err));
        if (created instanceof Error) throw created;
    }

    if (client !== CLIENT_NAME_DELTA) {
        const written = await invoke<null>("write_cookies", {
            profileId,
            cookie,
        }).catch((err) => new Error(err));
        if (written instanceof Error) throw written;
    } else {
        // Sandboxed (~/Library/Containers/{identifier}/Data/Library/Cookies/Cookies.binarycookies)
        const written = await invoke<null>("write_sandboxed_cookies", {
            profileId,
            cookie,
        }).catch((err) => new Error(err));
        if (written instanceof Error) throw written;
    }

    if ([CLIENT_NAME_HYDROGEN, CLIENT_NAME_RONIX].includes(client))
        invoke("copy_hydrogen_key", {
            client: client,
            profiles: store.profiles
                .filter((p) => p.id !== profileId)
                .map((p) => p.id),
            toId: profileId,
        });

    const entitlements =
        '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>com.apple.security.app-sandbox</key><true/><key>com.apple.security.network.client</key><true/><key>com.apple.security.network.server</key><true/></dict></plist>';
    const modified = await invoke<null>("modify_bundle_identifier", {
        client,
        profileId,
        entitlements: client === CLIENT_NAME_DELTA ? entitlements : null,
    }).catch((err) => new Error(err));
    if (modified instanceof Error) throw modified;

    interface State {
        profile_id: string;
        connected: boolean;
        pid: number;
        client: string | null;
        port: number | null;
    }
    let launched: State | Error;
    if (client !== CLIENT_NAME_DELTA) {
        launched = await invoke<State>("launch_client", {
            client,
            profileId,
        }).catch((err) => new Error(err));
        if (launched instanceof Error) throw launched;
    } else {
        launched = await invoke<State>("launch_sandboxed_client", {
            client,
            profileId,
        }).catch((err) => new Error(err));
        if (launched instanceof Error) throw launched;
    }

    const newProfile = {
        ...profile,
        lastPlayedAt: Date.now(),
    };

    await updateProfile(newProfile);

    return launched;
}

/**
 * Stops a running client process.
 * @param pid - The process ID of the client to stop
 */
export async function stopClient(pid: number) {
    const stopped = await invoke("stop_client", { pid }).catch(
        (err) => new Error(err),
    );
    if (stopped instanceof Error) throw stopped;
    if (!stopped)
        throw new Error("Client could not be stopped due to an unknown error.");
}

/**
 * Installs a client and adds it to the configuration.
 * @param client - The client name to install
 */
export async function installClient(client: string) {
    const version = useVersionStore.getState();

    let clientVersion = version.roblox.clientVersionUpload;
    let dylibVersion = version.roblox.version;
    if (client === CLIENT_NAME_VANILLA) {
        if (!clientVersion)
            throw new Error("Roblox version is not fetched yet.");
        if (!dylibVersion) throw new Error("Dylib version is not fetched yet.");
    } else if (client === CLIENT_NAME_MACSPLOIT) {
        if (
            !version.macsploit.clientVersionUpload ||
            !version.macsploit.relVersion
        )
            throw new Error("MacSploit version is not fetched yet.");

        clientVersion = version.macsploit.clientVersionUpload;
        dylibVersion = version.macsploit.relVersion;
    } else if (client === CLIENT_NAME_HYDROGEN) {
        if (
            !version.hydrogen.macos.roblox_version ||
            !version.hydrogen.macos.exploit_version
        )
            throw new Error("Hydrogen version is not fetched yet.");

        clientVersion = version.hydrogen.macos.roblox_version;
        dylibVersion = version.hydrogen.macos.exploit_version;
    } else if (client === CLIENT_NAME_RONIX) {
        if (
            !version.ronix.macos.roblox_version ||
            !version.ronix.macos.exploit_version
        )
            throw new Error("Ronix version is not fetched yet.");

        clientVersion = version.ronix.macos.roblox_version;
        dylibVersion = version.ronix.macos.exploit_version;
    } else if (client === CLIENT_NAME_CRYPTIC) {
        if (
            !version.cryptic.Versions.Roblox ||
            !version.cryptic.Versions.Software
        )
            throw new Error("Cryptic version is not fetched yet.");

        clientVersion = version.cryptic.Versions.Roblox;
        dylibVersion = version.cryptic.Versions.Software;
    } else if (client === CLIENT_NAME_OPIUMWARE) {
        if (
            !version.opiumware.SupportedRobloxVersion ||
            !version.opiumware.CurrentVersion
        )
            throw new Error("Opiumware version is not fetched yet.");

        clientVersion = version.opiumware.SupportedRobloxVersion;
        dylibVersion = version.opiumware.CurrentVersion;
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

/**
 * Removes a client from the system and updates the configuration.
 * @param client - The client name to remove
 */
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

/**
 * Installs an .ipa by forcing mac catalyst and adds it to the configuration.
 * @param client - The client name to install
 */
export async function installIpa(client: string) {
    const version = useVersionStore.getState();

    let ipaVersion = "";
    if (client === CLIENT_NAME_DELTA) {
        if (!version.delta)
            throw new Error("Delta version is not fetched yet.");
        ipaVersion = version.delta;
    }

    const installed = await invoke("install_ipa", {
        client,
        version: ipaVersion,
    }).catch((err: string) => new Error(err));
    if (installed instanceof Error) throw installed;

    const config = useConfigStore.getState();
    const newConfig = {
        ...config.config,
        clients: [
            ...config.config.clients,
            {
                name: client,
                version: ipaVersion,
            },
        ],
    };

    const written = await import("./config").then(({ writeConfig }) =>
        writeConfig(newConfig),
    );
    if (written) config.setConfig(newConfig);

    return;
}
