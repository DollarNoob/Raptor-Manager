import { motion } from "motion/react";
import { invoke } from "@tauri-apps/api/core";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { UI_STYLES } from "../../constants/ui";
import { useModalStore } from "../../store";
import type { IClientModalProps } from "../../types/editProfileModal";
import Button from "../Shared/Button";
import Option from "./Option";
import Text from "./Text";
import Title from "./Title";
import { IMacsploitSettings } from "../../types/macsploit";

export default function MacsploitModal({
    profile,
    destruct,
}: IClientModalProps) {
    const modal = useModalStore();
    const [settings, setSettings] = useState<IMacsploitSettings>();

    useEffect(() => {
        invoke<IMacsploitSettings>("macsploit_read_settings", {
            id: profile.id,
        })
            .then(setSettings)
            .catch((err: string) => {
                const id = crypto.randomUUID();
                modal.add({
                    id,
                    title: "Failed to load settings",
                    text: err,
                    buttons: [
                        {
                            text: "Okay",
                            onClick: () => modal.remove(id),
                        },
                    ],
                });
                destruct();
            });
    }, [profile.id]);

    async function importSettings() {
        const imported = await invoke<IMacsploitSettings>(
            "macsploit_read_settings",
        ).catch((err: string) => new Error(err));
        if (imported instanceof Error) {
            const id = crypto.randomUUID();
            modal.add({
                id,
                title: "Failed to import settings",
                text: imported.message,
                buttons: [
                    {
                        text: "Okay",
                        onClick: () => modal.remove(id),
                    },
                ],
            });
            return;
        }

        setSettings(imported);
    }

    async function save() {
        if (!settings) return;

        const saved = await invoke<IMacsploitSettings>(
            "macsploit_write_settings",
            { id: profile.id, settings },
        ).catch((err: string) => new Error(err));
        if (saved instanceof Error) {
            const id = crypto.randomUUID();
            modal.add({
                id,
                title: "Failed to save settings",
                text: saved.message,
                buttons: [
                    {
                        text: "Okay",
                        onClick: () => modal.remove(id),
                    },
                ],
            });
            return;
        }

        destruct();
    }

    const style: CSSProperties = {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        transformOrigin: "center",
        display: "flex",
        flexDirection: "column",
        minWidth: UI_STYLES.DIMENSIONS.MODAL_MIN_WIDTH,
        padding: UI_STYLES.SPACING.XLARGE,
        backgroundColor: UI_STYLES.COLORS.BACKGROUND_DARK,
        border: `1px solid ${UI_STYLES.COLORS.BORDER}`,
        borderRadius: UI_STYLES.DIMENSIONS.MODAL_BORDER_RADIUS,
        zIndex: 1,
    };

    const containerStyle: CSSProperties = {
        display: "flex",
        gap: UI_STYLES.SPACING.MEDIUM,
    };

    const optionContainerStyle: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: 4,
    };

    const buttonContainerStyle: CSSProperties = {
        display: "flex",
        gap: UI_STYLES.SPACING.MEDIUM,
    };

    const blurStyle: CSSProperties = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backdropFilter: "blur(4px)",
        zIndex: 0,
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                transition={{ duration: 0.2 }}
                style={{
                    ...style,
                    top: "50%",
                    left: "50%",
                    gap: UI_STYLES.SPACING.TINY,
                }}
            >
                <Title>MacSploit Settings</Title>
                <div style={containerStyle}>
                    <div style={optionContainerStyle}>
                        <Text>Main</Text>
                        <Option
                            settings={[settings, setSettings]}
                            name="autoExecute"
                        >
                            Auto Execute
                        </Option>
                        <Option
                            settings={[settings, setSettings]}
                            name="autoInject"
                        >
                            Uncap Fps
                        </Option>
                        <Option
                            settings={[settings, setSettings]}
                            name="multiInstance"
                        >
                            Error Redirection
                        </Option>
                        <Option
                            settings={[settings, setSettings]}
                            name="executeInstances"
                        >
                            Output Logging
                        </Option>
                    </div>
                    <div style={optionContainerStyle}>
                        <Text>Sandbox</Text>
                        <Option
                            settings={[settings, setSettings]}
                            name="fileSystem"
                        >
                            File System
                        </Option>
                        <Option
                            settings={[settings, setSettings]}
                            name="debugLibrary"
                        >
                            WebSocket Library
                        </Option>
                        <Option
                            settings={[settings, setSettings]}
                            name="httpTraffic"
                        >
                            HTTP Traffic
                        </Option>
                        <Option
                            settings={[settings, setSettings]}
                            name="settingsControl"
                        >
                            Queue On Teleport
                        </Option>
                    </div>
                    <div style={optionContainerStyle}>
                        <Text>Environment</Text>
                        <Option
                            settings={[settings, setSettings]}
                            name="serverTeleports"
                        >
                            Allow Server Teleports
                        </Option>
                        <Option
                            settings={[settings, setSettings]}
                            name="placeRestrictions"
                        >
                            Bypass Place Restrictions
                        </Option>
                        <Option
                            settings={[settings, setSettings]}
                            name="dumpScripts"
                        >
                            Dump All Scripts on Join
                        </Option>
                        <Option
                            settings={[settings, setSettings]}
                            name="logHttp"
                        >
                            Inject MacSploit (Auto)
                        </Option>
                        <Option
                            settings={[settings, setSettings]}
                            name="compatibilityMode"
                        >
                            Error Protection
                        </Option>
                    </div>
                    <div style={optionContainerStyle}>
                        <Text>Miscellaneous</Text>
                        <Option
                            settings={[settings, setSettings]}
                            name="norbUnc"
                        >
                            Custom MacSploit Locale
                        </Option>
                        <Option
                            settings={[settings, setSettings]}
                            name="resumeHandle"
                        >
                            Script HWID Spoofer
                        </Option>
                        <Option
                            settings={[settings, setSettings]}
                            name="robloxRpc"
                        >
                            MacSploit Presence
                        </Option>
                        <Option
                            settings={[settings, setSettings]}
                            name="discordRpc"
                        >
                            Discord Presence
                        </Option>
                        <Option
                            settings={[settings, setSettings]}
                            name="sandbox"
                        >
                            Decreased Sandbox
                        </Option>
                    </div>
                </div>
                <div style={buttonContainerStyle}>
                    <Button variant="modal" onClick={destruct}>
                        Cancel
                    </Button>
                    <Button variant="modal" onClick={importSettings}>
                        Import
                    </Button>
                    <Button variant="modal" onClick={save}>
                        Save
                    </Button>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={blurStyle}
            />
        </>
    );
}
