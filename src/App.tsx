import { useEffect, useRef, useState } from "react";
import "./App.css";
import { invoke } from "@tauri-apps/api/core";
import { emit, listen } from "@tauri-apps/api/event";
import Header from "./components/Header";
import Main from "./components/Main";
import Settings from "./components/Settings";
import { useModalStore, useTabStore } from "./store";
import type { IMessage } from "./types/message";
import type { IUpdate } from "./types/update";
import { openUrl } from "@tauri-apps/plugin-opener";

function App() {
    const modal = useModalStore();
    const tab = useTabStore();
    const [ready, setReady] = useState(false);
    const updateModalId = useRef<string | null>(null);

    const tabs = [<Main key="main" />, <Settings key="settings" />];

    useEffect(() => {
        async function update() {
            const updatingId = crypto.randomUUID();
            updateModalId.current = updatingId; // update modal id
            modal.add({
                id: updatingId,
                title: "Updating App",
                text: "Please do not close the application until the installation finishes.",
                progressText: "Preparing update...",
                progress: 0,
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
                    text: `${updated.message}\nClick 'Open' to open the download page for manual updates.`,
                    buttons: [
                        {
                            text: "Okay",
                            onClick: () => {
                                modal.remove(id);
                                modal.remove(updatingId);
                                updateModalId.current = null;
                            },
                        },
                        {
                            text: "Open",
                            onClick: () => {
                                modal.remove(id);
                                modal.remove(updatingId);
                                updateModalId.current = null;
                                openUrl(
                                    "https://github.com/DollarNoob/Raptor-Manager/releases/latest",
                                );
                            },
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
                            onClick: () => {
                                modal.remove(id);
                                modal.remove(updatingId);
                                updateModalId.current = null;
                            },
                        },
                    ],
                });
            }

            modal.remove(updatingId);
            updateModalId.current = null;
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

        const unlistenProgress = listen<[number, number]>(
            "update-progress",
            (event) => {
                if (!updateModalId.current) return;

                const downloaded = event.payload[0];
                const total = event.payload[1];
                const percent = Math.round((downloaded / total) * 100);

                modal.update(updateModalId.current, {
                    progressText: `Downloading: ${Math.round(downloaded / 1024 / 1024)} MB / ${Math.round(total / 1024 / 1024)} MB`,
                    progress: percent,
                });
            },
        );

        const unlistenFinish = listen<void>("update-finish", () => {
            if (!updateModalId.current) return;

            modal.update(updateModalId.current, {
                progressText: "Installing Update",
                progress: 100,
            });
        });

        if (!ready) {
            Promise.all([unlistenMessage, unlistenUpdate]).then(() =>
                emit("ready").then(() => setReady(true)),
            );
        }

        return () => {
            unlistenMessage.then((unlisten) => unlisten());
            unlistenUpdate.then((unlisten) => unlisten());
            unlistenProgress.then((unlisten) => unlisten());
            unlistenFinish.then((unlisten) => unlisten());
        };
    }, [ready, modal.add, modal.remove, modal.update]);

    useEffect(() => {
        const preventDefault = (event: MouseEvent) => event.preventDefault();
        window.addEventListener("contextmenu", preventDefault);

        return () => {
            window.removeEventListener("contextmenu", preventDefault);
        };
    }, []);

    return (
        <>
            <Header />
            {tabs[tab.tab]}
        </>
    );
}

export default App;
