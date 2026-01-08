import { invoke } from "@tauri-apps/api/core";
import { useVersionStore } from "../store";
import type {
    ICrypticVersion,
    IHydrogenVersion,
    IMacsploitVersion,
    IOpiumwareVersion,
    IRobloxVersion,
} from "../types/version";
import { showErrorModal } from "./modal";

/**
 * Fetches version information for all supported clients.
 * Updates the version store with the latest versions.
 * @returns True if all versions were fetched successfully, false otherwise
 */
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
    const crypticPromise = invoke<ICrypticVersion>("get_cryptic_version").catch(
        (err) => new Error(err),
    );
    const opiumwarePromise = invoke<IOpiumwareVersion>(
        "get_opiumware_version",
    ).catch((err) => new Error(err));
    const deltaPromise = invoke<string>("get_delta_version").catch(
        (err) => new Error(err),
    );

    const [roblox, macsploit, hydrogen, cryptic, opiumware, delta] =
        await Promise.all([
            robloxPromise,
            macsploitPromise,
            hydrogenPromise,
            crypticPromise,
            opiumwarePromise,
            deltaPromise,
        ]);

    if (roblox instanceof Error) {
        showErrorModal("Failed to fetch Roblox version", roblox.message);
        return false;
    }
    version.setRoblox(roblox);

    if (macsploit instanceof Error) {
        showErrorModal("Failed to fetch MacSploit version", macsploit.message);
        return false;
    }
    version.setMacsploit(macsploit);

    if (hydrogen instanceof Error) {
        showErrorModal("Failed to fetch Hydrogen version", hydrogen.message);
        return false;
    }
    version.setHydrogen(hydrogen);
    version.setRonix(hydrogen); // theyre both the same lol

    if (cryptic instanceof Error) {
        showErrorModal("Failed to fetch Cryptic version", cryptic.message);
        return false;
    }
    version.setCryptic(cryptic);

    if (opiumware instanceof Error) {
        showErrorModal("Failed to fetch Opiumware version", opiumware.message);
        return false;
    }
    version.setOpiumware(opiumware);

    if (delta instanceof Error) {
        showErrorModal("Failed to fetch Delta version", delta.message);
        return false;
    }
    version.setDelta(delta);

    return true;
}
