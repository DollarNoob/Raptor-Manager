import { invoke } from "@tauri-apps/api/core";
import { DECOMPILER_LIST } from "../../constants";
import { useConfigStore, useModalStore, useVersionStore } from "../../store";
import { installClient, removeClient, writeConfig } from "../../utils";
import Client from "./Client";
import Option from "./Option";

interface Props {
    children?: React.ReactNode;
}

export default function Settings(_props: Props) {
    const modal = useModalStore();
    const config = useConfigStore();
    const version = useVersionStore();

    async function onInstall(client: string) {
        const removed = await removeClient(client).catch(
            (err) => new Error(err),
        );
        if (removed instanceof Error) {
            const id = crypto.randomUUID();
            modal.add({
                id,
                title: `Failed to remove ${client}`,
                text: removed.message,
                buttons: [
                    {
                        text: "Okay",
                        onClick: () => modal.remove(id),
                    },
                ],
            });
            return;
        }

        const id = crypto.randomUUID();
        modal.add({
            id,
            title: `Installing ${client}`,
            text: "Please do not close the application until the installation finishes.",
            buttons: [],
        });

        const installed = await installClient(client).catch(
            (err) => new Error(err),
        );
        if (installed instanceof Error) {
            const _id = crypto.randomUUID();
            modal.add({
                id,
                title: `Failed to install ${client}`,
                text: installed.message,
                buttons: [
                    {
                        text: "Okay",
                        onClick: () => modal.remove(id) ?? modal.remove(_id),
                    },
                ],
            });
            return;
        }

        const _id = crypto.randomUUID();
        modal.add({
            id: _id,
            title: `Installed ${client}`,
            text: `${client} is now installed on your device!`,
            buttons: [
                {
                    text: "Okay",
                    onClick: () => modal.remove(id) ?? modal.remove(_id),
                },
            ],
        });
    }

    async function onRemove(client: string) {
        const removed = await removeClient(client).catch(
            (err) => new Error(err),
        );
        if (removed instanceof Error) {
            const id = crypto.randomUUID();
            modal.add({
                id,
                title: `Failed to remove ${client}`,
                text: removed.message,
                buttons: [
                    {
                        text: "Okay",
                        onClick: () => modal.remove(id),
                    },
                ],
            });
            return;
        }

        const id = crypto.randomUUID();
        modal.add({
            id,
            title: `Removed ${client}`,
            text: `${client} is now removed from your device!`,
            buttons: [
                {
                    text: "Okay",
                    onClick: () => modal.remove(id),
                },
            ],
        });
    }

    async function switchDecompiler() {
        const index = DECOMPILER_LIST.indexOf(
            config.config.decompiler as (typeof DECOMPILER_LIST)[number],
        );
        const newDecompiler =
            DECOMPILER_LIST[(index + 1) % DECOMPILER_LIST.length];

        await invoke<void>("update_decompiler", { decompiler: newDecompiler });

        const newConfig = {
            ...config.config,
            decompiler: newDecompiler,
        };

        const written = await writeConfig(newConfig);
        if (!written) return;

        config.setConfig(newConfig);
    }

    async function cleanCache() {
        const cleaned = await invoke<number>("clean_cache").catch((err: Error) => err);
        if (cleaned instanceof Error) {
            const id = crypto.randomUUID();
            modal.add({
                id,
                title: "Failed to clean cache",
                text: cleaned.message,
                buttons: [
                    {
                        text: "Okay",
                        onClick: () => modal.remove(id),
                    },
                ],
            });
            return;
        }

        if (cleaned === 0) {
            const id = crypto.randomUUID();
            modal.add({
                id,
                title: "No Cache",
                text: "You do not have any installation cache left on your device!",
                buttons: [
                    {
                        text: "Okay",
                        onClick: () => modal.remove(id),
                    },
                ],
            });
            return;
        }

        const id = crypto.randomUUID();
        modal.add({
            id,
            title: "Cleaned Cache",
            text: `Freed ${(cleaned / 1024 / 1024).toFixed(1)} MB from your device!`,
            buttons: [
                {
                    text: "Okay",
                    onClick: () => modal.remove(id),
                },
            ],
        });
    }

    const style: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        gap: 12,
        width: "100%",
    };

    const containerStyle: React.CSSProperties = {
        display: "flex",
        gap: 12,
    };

    const robloxInstallation = config.config.clients.find(
        (client) => client.name === "Vanilla",
    );
    const macsploitInstallation = config.config.clients.find(
        (client) => client.name === "MacSploit",
    );
    const hydrogenInstallation = config.config.clients.find(
        (client) => client.name === "Hydrogen",
    );

    return (
        <main style={style}>
            <div style={containerStyle}>
                <Client
                    installation={robloxInstallation}
                    version={version.roblox}
                    thumbnail="/roblox.svg"
                    onInstall={onInstall}
                    onRemove={onRemove}
                >
                    Vanilla
                </Client>
                <Client
                    installation={macsploitInstallation}
                    version={version.macsploit}
                    thumbnail="/macsploit.png"
                    onInstall={onInstall}
                    onRemove={onRemove}
                >
                    MacSploit
                </Client>
                <Client
                    installation={hydrogenInstallation}
                    version={version.hydrogen}
                    thumbnail="/hydrogen.png"
                    onInstall={onInstall}
                    onRemove={onRemove}
                >
                    Hydrogen
                </Client>
            </div>
            <div style={containerStyle}>
                <Option
                    title="Clean Installation Cache"
                    onClick={cleanCache}
                >
                    Clean Up
                </Option>
                <Option
                    title="Decompiler"
                    onClick={switchDecompiler}
                >
                    {
                        config.config.decompiler.charAt(0).toUpperCase() +
                        config.config.decompiler.slice(1)
                    }
                </Option>
            </div>
        </main>
    );
}
