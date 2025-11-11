import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import { useConfigStore, useModalStore, useTabStore } from "../../store";
import {
    fetchClientVersions,
    readConfig,
    readProfiles,
    writeConfig,
} from "../../Utils";
import Modal, { ModalButton } from "../Modal";
import Button from "./Button";
import ClientIcon from "./ClientIcon";
import SettingsIcon from "./SettingsIcon";
import Title from "./Title";

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

    const style: React.CSSProperties = {
        display: "flex",
        position: "relative",
        height: 46,
        gap: 6,
        paddingLeft: 8,
        paddingRight: 8,
        backgroundColor: "oklch(0.22 0 0)",
        border: "1px solid #FFFFFF20",
        borderRadius: 12,
        justifyContent: "end",
        alignItems: "center",
        zIndex: 3,
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
            <header style={style} data-tauri-drag-region>
                <Title version={version}>Raptor Manager</Title>
                <Button icon={<ClientIcon />} onClick={switchClient}>
                    {config.config.client}
                </Button>
                <Button
                    active={tab.tab === 1}
                    icon={<SettingsIcon />}
                    onClick={settings}
                ></Button>
            </header>
        </>
    );
}
