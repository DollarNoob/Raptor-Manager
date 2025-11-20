import { useEffect, useState } from "react";
import "./App.css";
import { invoke } from "@tauri-apps/api/core";
import { emit, listen } from "@tauri-apps/api/event";
import Header from "./components/Header";
import Main from "./components/Main";
import Settings from "./components/Settings";
import { useModalStore, useTabStore } from "./store";
import type { IMessage } from "./types/message";
import { IUpdate } from "./types/update";

function App() {
    const modal = useModalStore();
    const tab = useTabStore();
    const [ready, setReady] = useState(false);

    const tabs = [<Main key="main" />, <Settings key="settings" />];

    useEffect(() => {
        async function update() {
            const updatingId = crypto.randomUUID();
            modal.add({
                id: updatingId,
                title: "Updating App",
                text: "Please do not close the application until the installation finishes.",
                buttons: [],
            });

            const updated = await invoke<null>("update").catch(
                (err: string) => new Error(err),
            );
            if (updated instanceof Error) {
                const id = crypto.randomUUID();
                modal.add({
                    id,
                    title: "Failed to update app",
                    text: updated.message,
                    buttons: [
                        {
                            text: "Okay",
                            onClick: () =>
                                modal.remove(id) ?? modal.remove(updatingId),
                        },
                    ],
                });
            } else if (!updated) {
                const id = crypto.randomUUID();
                modal.add({
                    id,
                    title: "Failed to update app",
                    text: "Update was not found, you are currently on the latest version.",
                    buttons: [
                        {
                            text: "Okay",
                            onClick: () =>
                                modal.remove(id) ?? modal.remove(updatingId),
                        },
                    ],
                });
            }

            modal.remove(updatingId);
        }

        const unlistenMessage = listen<IMessage>("message", (event) => {
            const id = crypto.randomUUID();
            modal.add({
                id,
                title: event.payload.title,
                text: event.payload.description,
                buttons: [
                    {
                        text: "Okay",
                        onClick: () => modal.remove(id),
                    },
                ],
            });
        });

        const unlistenUpdate = listen<IUpdate | null>("update", (event) => {
            if (event.payload) {
                const id = crypto.randomUUID();
                modal.add({
                    id,
                    title: "Update Found",
                    text: `A new version v${event.payload.version} has been found:\n${event.payload.notes ?? "No update notes"}\nWould you like to install the update?`,
                    buttons: [
                        {
                            text: "No",
                            onClick: () => modal.remove(id),
                        },
                        {
                            text: "Yes",
                            onClick: () => modal.remove(id) ?? update(),
                        },
                    ],
                });
            }
        });

        if (!ready) {
            Promise.all([unlistenMessage, unlistenUpdate])
                .then(() => emit("ready")
                    .then(() => setReady(true))
                );
        }

        return () => {
            unlistenMessage.then((unlisten) => unlisten());
            unlistenUpdate.then((unlisten) => unlisten());
        };
    }, [ready, modal.add, modal.remove]);

    return (
        <>
            <Header />
            {tabs[tab.tab]}
        </>
    );
}

export default App;
