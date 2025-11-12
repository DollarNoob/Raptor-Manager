import { invoke } from "@tauri-apps/api/core";
import { useConfigStore, useModalStore } from "../store";
import type { IConfig } from "../types/config";

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
