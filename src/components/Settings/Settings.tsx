import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import {
    CLIENT_NAME_CRYPTIC,
    CLIENT_NAME_DELTA,
    CLIENT_NAME_HYDROGEN,
    CLIENT_NAME_MACSPLOIT,
    CLIENT_NAME_RONIX,
    CLIENT_NAME_VANILLA,
    DECOMPILER_LIST,
    URL_CRYPTIC,
    URL_DELTA,
    URL_HYDROGEN,
    URL_RAPTOR_FUN,
    URL_ROBLOX_HOME,
    URL_RONIX_STUDIOS,
} from "../../constants";
import { useConfigStore, useModalStore, useVersionStore } from "../../store";
import type { IInstallProgress } from "../../types/install";
import { installClient, removeClient, writeConfig } from "../../utils";
import Client from "./Client";
import Option from "./Option";
import { installIpa } from "../../utils/clients";

interface Props {
    children?: React.ReactNode;
}

export default function Settings(_props: Props) {
    const modal = useModalStore();
    const config = useConfigStore();
    const version = useVersionStore();
    const installModalId = useRef<string | null>(null);

    /*
    Monitor installation progress events
    Listens for install-progress events and updates the modal with progress text
    And percentage based on the current installation state (downloading, installing, etc.).
    */
    useEffect(() => {
        const unlisten = listen<IInstallProgress>(
            "install-progress",
            (event) => {
                if (!installModalId.current) return;

                switch (event.payload.state) {
                    case "download-roblox": {
                        if (!event.payload.progress) return;
                        const downloaded = event.payload.progress[0];
                        const total = event.payload.progress[1];
                        const percent = Math.round((downloaded / total) * 100);

                        modal.update(installModalId.current, {
                            progressText: `Downloading Roblox: ${Math.round(downloaded / 1024 / 1024)} MB / ${Math.round(total / 1024 / 1024)} MB`,
                            progress: percent,
                        });
                        break;
                    }
                    case "download-ipa": {
                        if (!event.payload.progress) return;
                        const downloaded = event.payload.progress[0];
                        const total = event.payload.progress[1];
                        const percent = Math.round((downloaded / total) * 100);

                        modal.update(installModalId.current, {
                            progressText: `Downloading .ipa: ${Math.round(downloaded / 1024 / 1024)} MB / ${Math.round(total / 1024 / 1024)} MB`,
                            progress: percent,
                        });
                        break;
                    }
                    case "download-insert-dylib": {
                        modal.update(installModalId.current, {
                            progressText: "Downloading insert_dylib...",
                            progress: 10,
                        });
                        break;
                    }
                    case "install-insert-dylib": {
                        modal.update(installModalId.current, {
                            progressText: "Installing insert_dylib...",
                            progress: 20,
                        });
                        break;
                    }
                    case "install-roblox": {
                        modal.update(installModalId.current, {
                            progressText: "Installing Roblox client...",
                            progress: 35,
                        });
                        break;
                    }
                    case "install-ipa": {
                        modal.update(installModalId.current, {
                            progressText: "Installing .ipa...",
                            progress: 35,
                        });
                        break;
                    }
                    case "download-dylib": {
                        modal.update(installModalId.current, {
                            progressText: "Downloading dylib...",
                            progress: 50,
                        });
                        break;
                    }
                    case "remove-codesign": {
                        modal.update(installModalId.current, {
                            progressText: "Removing codesign...",
                            progress: 65,
                        });
                        break;
                    }
                    case "insert-dylib": {
                        modal.update(installModalId.current, {
                            progressText: "Inserting dylib...",
                            progress: 80,
                        });
                        break;
                    }
                    case "apply-codesign": {
                        modal.update(installModalId.current, {
                            progressText: "Applying codesign...",
                            progress: 90,
                        });
                        break;
                    }
                    case "convert-ipa": {
                        modal.update(installModalId.current, {
                            progressText: "Converting .ipa into .app...",
                            progress: 80,
                        });
                        break;
                    }
                }
            },
        );

        return () => {
            unlisten.then((unlisten) => unlisten());
        };
    }, [modal.update]);

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
        installModalId.current = id; // install modal id
        modal.add({
            id,
            title: `Installing ${client}`,
            text: "Please do not close the application until the installation finishes.",
            progressText: "Preparing installation...",
            progress: 0,
            buttons: [],
        });

        if (client !== CLIENT_NAME_DELTA) {
            // .app
            const installed = await installClient(client).catch(
                (err) => new Error(err),
            );
            if (installed instanceof Error) {
                const _id = crypto.randomUUID();
                modal.add({
                    id: _id,
                    title: `Failed to install ${client}`,
                    text: installed.message,
                    buttons: [
                        {
                            text: "Okay",
                            onClick: () => {
                                modal.remove(id);
                                modal.remove(_id);
                                installModalId.current = null;
                            },
                        },
                    ],
                });
                installModalId.current = null;
                return;
            }
        } else {
            // .ipa (Mac Catalyst)
            const installed = await installIpa(client).catch(
                (err) => new Error(err),
            );
            if (installed instanceof Error) {
                const _id = crypto.randomUUID();
                modal.add({
                    id: _id,
                    title: `Failed to install ${client}`,
                    text: installed.message,
                    buttons: [
                        {
                            text: "Okay",
                            onClick: () => {
                                modal.remove(id);
                                modal.remove(_id);
                                installModalId.current = null;
                            },
                        },
                    ],
                });
                installModalId.current = null;
                return;
            }
        }

        modal.update(id, {
            progressText: "Installation complete!",
            progress: 100,
        });

        const _id = crypto.randomUUID();
        modal.add({
            id: _id,
            title: `Installed ${client}`,
            text: `${client} is now installed on your device!\nBecause this client is an iPad app, controls could be broken.`,
            buttons: [
                {
                    text: "Okay",
                    onClick: () => {
                        modal.remove(id);
                        modal.remove(_id);
                        installModalId.current = null;
                    },
                },
            ],
        });
        installModalId.current = null;
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
        const cleaned = await invoke<number>("clean_cache").catch(
            (err: Error) => err,
        );
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
        overflowY: "scroll",
    };

    const containerStyle: React.CSSProperties = {
        display: "flex",
        gap: 12,
        minHeight: "fit-content",
    };

    const robloxInstallation = config.config.clients.find(
        (client) => client.name === CLIENT_NAME_VANILLA,
    );
    const macsploitInstallation = config.config.clients.find(
        (client) => client.name === CLIENT_NAME_MACSPLOIT,
    );
    const hydrogenInstallation = config.config.clients.find(
        (client) => client.name === CLIENT_NAME_HYDROGEN,
    );
    const ronixInstallation = config.config.clients.find(
        (client) => client.name === CLIENT_NAME_RONIX,
    );
    const crypticInstallation = config.config.clients.find(
        (client) => client.name === CLIENT_NAME_CRYPTIC,
    );
    const deltaInstallation = config.config.clients.find(
        (client) => client.name === CLIENT_NAME_DELTA,
    );

    return (
        <main style={style}>
            <div style={containerStyle}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 * 0.05 }}
                    style={{ flex: 1 }}
                >
                    <Client
                        installation={robloxInstallation}
                        version={version.roblox}
                        thumbnail="/roblox.svg"
                        onInstall={onInstall}
                        onRemove={onRemove}
                        href={URL_ROBLOX_HOME}
                    >
                        Vanilla
                    </Client>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 * 0.05 }}
                    style={{ flex: 1 }}
                >
                    <Client
                        installation={macsploitInstallation}
                        version={version.macsploit}
                        thumbnail="/macsploit.png"
                        onInstall={onInstall}
                        onRemove={onRemove}
                        href={URL_RAPTOR_FUN}
                    >
                        MacSploit
                    </Client>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2 * 0.05 }}
                    style={{ flex: 1 }}
                >
                    <Client
                        installation={crypticInstallation}
                        version={version.cryptic}
                        thumbnail="/cryptic.webp"
                        onInstall={onInstall}
                        onRemove={onRemove}
                        href={URL_CRYPTIC}
                    >
                        Cryptic
                    </Client>
                </motion.div>
            </div>
            <div style={containerStyle}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3 * 0.05 }}
                    style={{ flex: 1 }}
                >
                    <Client
                        installation={hydrogenInstallation}
                        version={version.hydrogen}
                        thumbnail="/hydrogen.png"
                        onInstall={onInstall}
                        onRemove={onRemove}
                        href={URL_HYDROGEN}
                    >
                        Hydrogen
                    </Client>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 4 * 0.05 }}
                    style={{ flex: 1 }}
                >
                    <Client
                        installation={ronixInstallation}
                        version={version.ronix}
                        thumbnail="/ronix.png"
                        onInstall={onInstall}
                        onRemove={onRemove}
                        href={URL_RONIX_STUDIOS}
                    >
                        Ronix
                    </Client>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 5 * 0.05 }}
                    style={{ flex: 1 }}
                >
                    <Client
                        installation={deltaInstallation}
                        version={version.delta}
                        thumbnail="/delta.png"
                        onInstall={onInstall}
                        onRemove={onRemove}
                        href={URL_DELTA}
                    >
                        Delta iOS
                    </Client>
                </motion.div>
            </div>
            <div style={containerStyle}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 5 * 0.05 }}
                    style={{ flex: 1 }}
                >
                    <Option
                        title="Clean Installation Cache"
                        onClick={cleanCache}
                    >
                        Clean Up
                    </Option>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 6 * 0.05 }}
                    style={{ flex: 1 }}
                >
                    <Option title="Decompiler" onClick={switchDecompiler}>
                        {config.config.decompiler.charAt(0).toUpperCase() +
                            config.config.decompiler.slice(1)}
                    </Option>
                </motion.div>
            </div>
        </main>
    );
}
