import { invoke } from "@tauri-apps/api/core";
import { Menu } from "@tauri-apps/api/menu";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import {
    CLIENT_NAME_CRYPTIC,
    CLIENT_NAME_HYDROGEN,
    CLIENT_NAME_MACSPLOIT,
    CLIENT_NAME_OPIUMWARE,
    CLIENT_NAME_RONIX,
    CONTEXT_MENU_ITEMS,
} from "../../constants";
import { useContextStore, useModalStore } from "../../store";
import type { IProfile } from "../../types/profile";
import type { IState } from "../../types/state";
import { removeProfile } from "../../utils";
import { useMenuIcon } from "../../utils/menuIcon";
import EditProfileModal from "../EditProfileModal";
import MacsploitModal from "../MacsploitModal";
import Status from "../Shared/Status";
import Profile from "./Profile";
import Thumbnail from "./Thumbnail";

interface Props {
    active: boolean;
    profile: IProfile;
    state: IState;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    children?: React.ReactNode;
}

export default function Account({ active, profile, state, onClick }: Props) {
    const modal = useModalStore();
    const context = useContextStore();
    const [profileModal, setProfileModal] = useState<React.ReactNode | null>(
        null,
    );
    const [macsploitModal, setMacsploitModal] =
        useState<React.ReactNode | null>(null);

    // Create a function to handle activation that can be called from both mouse and keyboard events
    const handleActivate = () => {
        if (onClick) {
            onClick({} as React.MouseEvent<HTMLButtonElement>);
        }
    };

    async function contextMenu(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        const menu = await Menu.new({
            items: [
                {
                    id: "edit_profile",
                    text: CONTEXT_MENU_ITEMS.EDIT_PROFILE,
                    icon: "Remove",
                    action: handleEvents,
                },
                {
                    id: "edit_macsploit",
                    text: CONTEXT_MENU_ITEMS.EDIT_MACSPOILT,
                    // biome-ignore lint/correctness/useHookAtTopLevel: why would you load this at top level?
                    icon: await useMenuIcon("macsploit.png"),
                    action: handleEvents,
                },
                {
                    id: "delete_profile",
                    text: CONTEXT_MENU_ITEMS.DELETE_PROFILE,
                    icon: "StopProgress",
                    action: handleEvents,
                },
                {
                    id: "open_profile_folder",
                    text: CONTEXT_MENU_ITEMS.OPEN_PROFILE_FOLDER,
                    icon: "Folder",
                    action: handleEvents,
                },
                {
                    id: "open_container_folder",
                    text: CONTEXT_MENU_ITEMS.OPEN_CONTAINER_FOLDER,
                    icon: "Folder",
                    action: handleEvents,
                },
            ],
        });
        menu.popup();
    }

    async function handleEvents(id: string) {
        switch (id) {
            case "edit_profile": {
                const destruct = () => setProfileModal(null);
                setProfileModal(
                    <EditProfileModal profile={profile} destruct={destruct} />,
                );
                break;
            }
            case "edit_macsploit": {
                const destruct = () => setMacsploitModal(null);
                setMacsploitModal(
                    <MacsploitModal profile={profile} destruct={destruct} />,
                );
                break;
            }
            case "delete_profile": {
                const id = crypto.randomUUID();
                modal.add({
                    id,
                    title: "Remove Profile",
                    text: `Are you sure you want to delete '${profile.name ?? `Profile: ${profile.id}`}'?`,
                    buttons: [
                        {
                            text: "No",
                            onClick: () => modal.remove(id),
                        },
                        {
                            text: "Yes",
                            onClick: () =>
                                modal.remove(id) ?? removeProfile(profile.id),
                        },
                    ],
                });
                break;
            }
            case "open_profile_folder": {
                const open = await invoke<number>("open_profile_folder", {
                    id: profile.id,
                }).catch((err) => new Error(err));

                if (open instanceof Error) {
                    const id = crypto.randomUUID();
                    modal.add({
                        id,
                        title: "Failed to open profile folder",
                        text: open.message,
                        buttons: [
                            {
                                text: "Okay",
                                onClick: () => modal.remove(id),
                            },
                        ],
                    });
                    return;
                }

                if (open !== 0) {
                    const id = crypto.randomUUID();
                    modal.add({
                        id,
                        title: "Failed to open profile folder",
                        text: `Could not open profile folder with code ${open}.`,
                        buttons: [
                            {
                                text: "Okay",
                                onClick: () => modal.remove(id),
                            },
                        ],
                    });
                    return;
                }
                break;
            }
            case "open_container_folder": {
                const open = await invoke<number>("open_container_folder", {
                    id: profile.id,
                }).catch((err) => new Error(err));

                if (open instanceof Error) {
                    const id = crypto.randomUUID();
                    modal.add({
                        id,
                        title: "Failed to open container folder",
                        text: open.message,
                        buttons: [
                            {
                                text: "Okay",
                                onClick: () => modal.remove(id),
                            },
                        ],
                    });
                    return;
                }

                if (open !== 0) {
                    const id = crypto.randomUUID();
                    modal.add({
                        id,
                        title: "Failed to open container folder",
                        text: `Could not open container folder with code ${open}.`,
                        buttons: [
                            {
                                text: "Okay",
                                onClick: () => modal.remove(id),
                            },
                        ],
                    });
                    return;
                }
                break;
            }
        }
    }

    const style: React.CSSProperties = {
        display: "flex",
        width: "100%",
        height: 64,
        gap: 10,
        backgroundColor: active ? "oklch(0.28 0 0)" : "inherit",
        padding: 10,
        borderRadius: 12,
        justifyContent: "space-between",
        cursor: "pointer",
    };

    const leftContainerStyle: React.CSSProperties = {
        display: "flex",
        flex: 1,
        gap: 10,
        minWidth: 0,
    };

    const rightContainerStyle: React.CSSProperties = {
        display: "flex",
        minWidth: "fit-content",
        alignItems: "center",
        flexShrink: 0,
    };

    function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleActivate();
        }
    }

    let statusText = "Offline";
    if (state.connected && state.client) {
        statusText = state.client;
        if (state.port) {
            // modified clients
            statusText = state.client;
            if (
                [CLIENT_NAME_MACSPLOIT, CLIENT_NAME_OPIUMWARE].includes(
                    state.client,
                )
            ) {
                statusText += ` ${state.port}`;
            } else if (
                [
                    CLIENT_NAME_HYDROGEN,
                    CLIENT_NAME_RONIX,
                    CLIENT_NAME_CRYPTIC,
                ].includes(state.client)
            ) {
                if (state.profileId === context.id) {
                    statusText += " Attached";
                }
            }
        }
    }

    return (
        <>
            <AnimatePresence>
                {profileModal}
                {macsploitModal}
            </AnimatePresence>
            <button
                type="button"
                style={style}
                onClick={onClick}
                onKeyDown={handleKeyDown}
                onContextMenu={contextMenu}
                tabIndex={0}
            >
                <div style={leftContainerStyle}>
                    {profile.thumbnail && (
                        <Thumbnail thumbnail={profile.thumbnail} size={44} />
                    )}
                    <Profile profile={profile} />
                </div>
                <div style={rightContainerStyle}>
                    <Status color={state.connected ? "green" : "red"}>
                        {statusText}
                    </Status>
                </div>
            </button>
        </>
    );
}
