import { invoke } from "@tauri-apps/api/core";
import { useConfigStore } from "../store";
import type { IConfig } from "../types/config";
import { showConfirmationModal, showErrorModal } from "./modal";

export async function readConfig() {
    const cfg = await invoke<IConfig>("read_config").catch(
        (err) => new Error(err),
    );

    if (cfg instanceof Error) {
        showConfirmationModal(
            "Failed to read config",
            `${cfg.message} Would you like to reset the config?`,
            () =>
                writeConfig({
                    client: null,
                    clients: [],
                    decompiler: "medal",
                }),
        );
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
        showErrorModal("Failed to write config", cfg.message);
        return false;
    }
    return true;
}
