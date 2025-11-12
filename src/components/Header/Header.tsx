import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import { useConfigStore, useModalStore, useTabStore } from "../../store";
import {
    fetchClientVersions,
    readConfig,
    readProfiles,
    writeConfig,
} from "../../utils";
import ClientIcon from "../icons/ClientIcon";
import SettingsIcon from "../icons/SettingsIcon";
import Modal, { ModalButton } from "../Modal";
import Button from "../Shared/Button";

interface Props {
    children?: React.ReactNode;
}

export default function Header(_props: Props) {
    const modal = useModalStore();
    const config = useConfigStore();
    const tab = useTabStore();
    const [version, setVersion] = useState("");

    useEffect(() => {
        getVersion().then(setVersion);
        readConfig();
        readProfiles();
        fetchClientVersions();
    }, []);

    function switchClient() {
        if (config.config.clients.length === 0) {
            const id = crypto.randomUUID();
            modal.add({
                id,
                title: "No client installation found",
                text: "Please install a client from the settings tab before selecting one!",
                buttons: [
                    {
                        text: "Okay",
                        onClick: () => modal.remove(id),
                    },
                ],
            });
            return;
        }

        const index = config.config.clients.findIndex(
            (client) => client.name === config.config.client,
        );
        if (index === -1) {
            writeConfig({
                ...config.config,
                client: config.config.clients[0].name,
            });
            return;
        }

        const newIndex = (index + 1) % config.config.clients.length;
        if (newIndex === 0) {
            writeConfig({ ...config.config, client: null });
            return;
        }
        writeConfig({
            ...config.config,
            client: config.config.clients[newIndex].name,
        });
    }

    function settings() {
        tab.setTab((tab.tab + 1) % tab.tabCount);
    }

    const headerStyle: React.CSSProperties = {
        position: "relative",
        height: 46,
        paddingLeft: 8,
        paddingRight: 8,
        backgroundColor: "oklch(0.22 0 0)",
        border: "1px solid #FFFFFF20",
        borderRadius: 12,
        zIndex: 3,
    };

    const centerSectionStyle: React.CSSProperties = {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        alignItems: "center",
        gap: 8,
    };

    const rightSectionStyle: React.CSSProperties = {
        position: "absolute",
        right: 8,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 6,
    };

    const titleTextStyle: React.CSSProperties = {
        color: "oklch(0.9 0 0)",
        fontFamily: "Avenir",
        fontSize: 20,
        fontWeight: 800,
    };

    const versionStyle: React.CSSProperties = {
        paddingLeft: 4,
        paddingRight: 4,
        backgroundColor: "oklch(0.4 0 0)",
        color: "oklch(0.9 0 0)",
        border: "1px solid #FFFFFF20",
        borderRadius: 12,
        fontFamily: "Avenir",
        fontSize: 10,
        fontWeight: 500,
    };

    const betaStyle: React.CSSProperties = {
        paddingLeft: 4,
        paddingRight: 4,
        backgroundColor: "oklch(0.68 0.22 30)",
        color: "white",
        border: "1px solid #FFFFFF20",
        borderRadius: 12,
        fontFamily: "Avenir",
        fontSize: 10,
        fontWeight: 500,
    };

    return (
        <>
            {modal.modals.length !== 0 && (
                <Modal
                    key={modal.modals[0].id}
                    title={modal.modals[0].title}
                    text={modal.modals[0].text}
                >
                    {modal.modals[0].buttons.map((button) => (
                        <ModalButton
                            key={button.text}
                            icon={button.icon}
                            onClick={button.onClick}
                        >
                            {button.text}
                        </ModalButton>
                    ))}
                </Modal>
            )}
            <header style={headerStyle} data-tauri-drag-region>
                <div style={centerSectionStyle} data-tauri-drag-region>
                    <span style={titleTextStyle} data-tauri-drag-region>
                        Raptor Manager
                    </span>
                    {version && (
                        <div style={versionStyle} data-tauri-drag-region>
                            v{version}
                        </div>
                    )}
                    <div style={betaStyle} data-tauri-drag-region>
                        BETA
                    </div>
                </div>
                <div style={rightSectionStyle}>
                    <Button
                        variant="header"
                        icon={<ClientIcon />}
                        onClick={switchClient}
                    >
                        {config.config.client}
                    </Button>
                    <Button
                        variant="header"
                        active={tab.tab === 1}
                        icon={<SettingsIcon />}
                        onClick={settings}
                    ></Button>
                </div>
            </header>
        </>
    );
}
