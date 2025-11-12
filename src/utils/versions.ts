import { invoke } from "@tauri-apps/api/core";
import { useModalStore, useVersionStore } from "../store";
import type {
    IHydrogenVersion,
    IMacsploitVersion,
    IRobloxVersion,
} from "../types/version";

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
