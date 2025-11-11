import { invoke } from "@tauri-apps/api/core";
import { useConfigStore, useModalStore, useVersionStore } from "../../store";
import { installClient, removeClient, writeConfig } from "../../Utils";
import Button from "../Shared/Button";
import Client from "./Client";

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
        const decompilerList = ["medal", "konstant"];

        const index = decompilerList.indexOf(config.config.decompiler);
        const newDecompiler =
            decompilerList[(index + 1) % decompilerList.length];

        await invoke<void>("update_decompiler", { decompiler: newDecompiler });

        const newConfig = {
            ...config.config,
            decompiler: newDecompiler,
        };

        const written = await writeConfig(newConfig);
        if (!written) return;

        config.setConfig(newConfig);
    }

    const style: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        gap: 12,
        width: "100%",
    };

    const clientContainerStyle: React.CSSProperties = {
        display: "flex",
        flexGrow: 1,
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
            <div style={clientContainerStyle}>
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
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                {/* @ts-ignore */}
                <Button variant="settings" color="blue" onClick={switchDecompiler} style={{ width: "100%", maxWidth: "300px" }}>
                    {config.config.decompiler.charAt(0).toUpperCase() +
                        config.config.decompiler.slice(1)}
                </Button>
            </div>
        </main>
    );
}
