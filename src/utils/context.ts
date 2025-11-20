import { invoke } from "@tauri-apps/api/core";
import { useContextStore, useModalStore } from "../store";

export async function setContext(id: string) {
    const contextHydro = await invoke<void>("update_hydrobridge", { id }).catch(
        (err) => new Error(err),
    );
    const contextCryptic = await invoke<void>("update_crypticbridge", {
        id,
    }).catch((err) => new Error(err));

    if (contextHydro instanceof Error) {
        const modal = useModalStore.getState();
        const id = crypto.randomUUID();
        modal.add({
            id,
            title: "Failed to set hydrobridge context",
            text: contextHydro.message,
            buttons: [
                {
                    text: "Okay",
                    onClick: () => modal.remove(id),
                },
            ],
        });
        return;
    }
    if (contextCryptic instanceof Error) {
        const modal = useModalStore.getState();
        const id = crypto.randomUUID();
        modal.add({
            id,
            title: "Failed to set crypticbridge context",
            text: contextCryptic.message,
            buttons: [
                {
                    text: "Okay",
                    onClick: () => modal.remove(id),
                },
            ],
        });
        return;
    }

    useContextStore.getState().setId(id);
}
