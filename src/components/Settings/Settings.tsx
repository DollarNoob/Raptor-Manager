import { invoke } from "@tauri-apps/api/core";
import { motion } from "motion/react";
import { DECOMPILER_LIST } from "../../constants";
import { useConfigStore, useModalStore, useVersionStore } from "../../store";
import { installClient, removeClient, writeConfig } from "../../utils";
import Client from "./Client";
import Option from "./Option";
import { useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import type { IInstallProgress } from "../../types/install";

interface Props {
    children?: React.ReactNode;
}

export default function Settings(_props: Props) {
    const modal = useModalStore();
    const config = useConfigStore();
    const version = useVersionStore();
    const installModalId = useRef<string | null>(null);

    useEffect(() => {
        let idk = 0;
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

                        if (idk++ % 100 === 0)
                            console.log(
                                `[INSTALL] 1: Downloaded ${downloaded} bytes out of ${total} bytes of Roblox client.`,
                            );
                        break;
                    }
                    case "download-insert-dylib": {
                        console.log("[INSTALL] 2: Downloading insert_dylib.");
                        modal.update(installModalId.current, {
                            progressText: "Downloading insert_dylib...",
                            progress: 10,
                        });
                        break;
                    }
                    case "install-insert-dylib": {
                        console.log("[INSTALL] 3: Installing insert_dylib.");
                        modal.update(installModalId.current, {
                            progressText: "Installing insert_dylib...",
                            progress: 20,
                        });
                        break;
                    }
                    case "install-roblox": {
                        console.log("[INSTALL] 4: Installing Roblox client.");
                        modal.update(installModalId.current, {
                            progressText: "Installing Roblox client...",
                            progress: 35,
                        });
                        break;
                    }
                    case "download-dylib": {
                        console.log("[INSTALL] 5: Downloading dylib.");
                        modal.update(installModalId.current, {
                            progressText: "Downloading dylib...",
                            progress: 50,
                        });
                        break;
                    }
                    case "remove-codesign": {
                        console.log("[INSTALL] 6: Removing codesign.");
                        modal.update(installModalId.current, {
                            progressText: "Removing codesign...",
                            progress: 65,
                        });
                        break;
                    }
                    case "insert-dylib": {
                        console.log("[INSTALL] 7: Inserting dylib.");
                        modal.update(installModalId.current, {
                            progressText: "Inserting dylib...",
                            progress: 80,
                        });
                        break;
                    }
                    case "apply-codesign": {
                        console.log("[INSTALL] 8: Applying codesign.");
                        modal.update(installModalId.current, {
                            progressText: "Applying codesign...",
                            progress: 90,
                        });
                        break;
                    }
                }
            },
        );

        return () => {
            unlisten.then((unlisten) => unlisten());
        };
    }, []);

    async function onInstall(client: string) {
        console.log("[INSTALL] 0: Removing current client installation.");

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

        // stage 9 (try to clean unused version zips, it is okay to fail)
        console.log("[INSTALL] 9: Cleaning unused installation cache.");
        const versions: string[] = [];
        versions.push(version.roblox.clientVersionUpload);
        versions.push(version.macsploit.clientVersionUpload);
        versions.push(version.hydrogen.macos.roblox_version ?? "");
        versions.push(version.cryptic.Versions.Roblox);
        await invoke("clean_leftover_cache", { versions }).catch(() => null);

        modal.update(id, {
            progressText: "Installation complete!",
            progress: 100,
        });

        const _id = crypto.randomUUID();
        modal.add({
            id: _id,
            title: `Installed ${client}`,
            text: `${client} is now installed on your device!`,
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
        (client) => client.name === "Vanilla",
    );
    const macsploitInstallation = config.config.clients.find(
        (client) => client.name === "MacSploit",
    );
    const hydrogenInstallation = config.config.clients.find(
        (client) => client.name === "Hydrogen",
    );
    const ronixInstallation = config.config.clients.find(
        (client) => client.name === "Ronix",
    );
    const crypticInstallation = config.config.clients.find(
        (client) => client.name === "Cryptic",
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
                        href="https://www.roblox.com/home"
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
                        href="https://raptor.fun/"
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
                        href="https://getcryptic.net/"
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
                        href="https://hydrogen.lat/"
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
                        href="https://ronixstudios.io/"
                    >
                        Ronix
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
