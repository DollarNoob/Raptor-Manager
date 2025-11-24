import { invoke } from "@tauri-apps/api/core";
import { useContextStore } from "../store";
import { showErrorModal } from "./modal";

export async function setContext(id: string) {
    const contextHydro = await invoke<void>("update_hydrobridge", { id }).catch(
        (err) => new Error(err),
    );
    const contextCryptic = await invoke<void>("update_crypticbridge", {
        id,
    }).catch((err) => new Error(err));

    if (contextHydro instanceof Error) {
        showErrorModal(
            "Failed to set hydrobridge context",
            contextHydro.message,
        );
        return;
    }
    if (contextCryptic instanceof Error) {
        showErrorModal(
            "Failed to set crypticbridge context",
            contextCryptic.message,
        );
        return;
    }

    useContextStore.getState().setId(id);
}
