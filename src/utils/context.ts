import { invoke } from "@tauri-apps/api/core";
import { useContextStore, useModalStore } from "../store";

export async function setContext(id: string) {
    const context = await invoke<void>("update_hydrobridge", { id }).catch(
        (err) => new Error(err),
    );

    if (context instanceof Error) {
        const modal = useModalStore.getState();
        const id = crypto.randomUUID();
        modal.add({
            id,
            title: "Failed to set config",
            text: context.message,
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
