import { useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import Main from "./components/Main";
import Settings from "./components/Settings";
import { useModalStore, useTabStore } from "./store";
import { emit, listen } from "@tauri-apps/api/event";
import { IMessage } from "./types/message";
import { invoke } from "@tauri-apps/api/core";

function App() {
    const modal = useModalStore();
    const tab = useTabStore();

    const tabs = [<Main key="main" />, <Settings key="settings" />];

    useEffect(() => {
        emit("ready");
    }, []);

    useEffect(() => {
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

        const unlistenUpdate = listen<string | null>("update", (event) => {
            if (event.payload) {
                const id = crypto.randomUUID();
                modal.add({
                    id,
                    title: "Update Found",
                    text: `A new version ${event.payload} has been found!\nWould you like to install the update?`,
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

        return () => {
            unlistenMessage.then((unlisten) => unlisten());
            unlistenUpdate.then((unlisten) => unlisten());
        };
    }, [modal.add, modal.remove]);

    function update() {
        const updated = invoke<null>("update").catch((err: string) => new Error(err));
        if (updated instanceof Error) {
            const id = crypto.randomUUID();
            modal.add({
                id,
                title: "Failed to update app",
                text: updated.message,
                buttons: [
                    {
                        text: "Okay",
                        onClick: () => modal.remove(id),
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
                        onClick: () => modal.remove(id),
                    },
                ],
            });
        }
    }

    return (
        <>
            <Header />
            {tabs[tab.tab]}
        </>
    );
}

export default App;
