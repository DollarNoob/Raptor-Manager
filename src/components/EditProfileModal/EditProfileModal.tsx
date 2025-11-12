import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type React from "react";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { UI_STYLES } from "../../constants/ui";
import { useModalStore } from "../../store";
import type { IEditProfileModalProps } from "../../types/editProfileModal";
import type { IProfile, IRobloxProfile } from "../../types/profile";
import { updateProfile } from "../../utils";
import Button from "../Shared/Button";
import Input from "./Input";
import Text from "./Text";
import Title from "./Title";

export default function EditProfileModal({
    profile,
    destruct,
}: IEditProfileModalProps) {
    const modal = useModalStore();
    const cookieRef =
        useRef<[string, React.Dispatch<React.SetStateAction<string>>]>(null);
    const nameRef =
        useRef<[string, React.Dispatch<React.SetStateAction<string>>]>(null);
    const noteRef =
        useRef<[string, React.Dispatch<React.SetStateAction<string>>]>(null);

    useEffect(() => {
        const unlisten = listen<string>("import_cookies", (event) => {
            if (!cookieRef.current) return;
            cookieRef.current[1](event.payload);
        });

        return () => {
            unlisten.then((unlisten) => unlisten());
        };
    }, []);

    async function importCookies() {
        const session = await invoke("import_cookies").catch(
            (err) => new Error(err),
        );
        if (session instanceof Error) {
            if (
                session.message ===
                "a webview with label `login` already exists"
            ) {
                const id = crypto.randomUUID();
                modal.add({
                    id,
                    title: "Import Cookie",
                    text: "You already have a webview open, please close it and try again.",
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
                title: "Failed to import cookie",
                text: session.message,
                buttons: [
                    {
                        text: "Okay",
                        onClick: () => modal.remove(id),
                    },
                ],
            });
            return;
        }
    }

    async function update() {
        if (!cookieRef.current || !nameRef.current || !noteRef.current) return;

        const mId = crypto.randomUUID();
        modal.add({
            id: mId,
            title: "Edit Profile",
            text: "Authenticating with Roblox.",
            buttons: [],
        });

        const robloxProfile = await invoke<IRobloxProfile>(
            "get_roblox_profile",
            {
                cookie: cookieRef.current[0],
            },
        ).catch((err) => new Error(err));
        if (robloxProfile instanceof Error) {
            modal.remove(mId);
            const _id = crypto.randomUUID();
            modal.add({
                id: _id,
                title: "Failed to authenticate",
                text:
                    robloxProfile.message === "401 Unauthorized"
                        ? "Provided cookie is invalid. Try using import to load a cookie."
                        : robloxProfile.message,
                buttons: [
                    {
                        text: "Okay",
                        onClick: () => modal.remove(_id),
                    },
                ],
            });
            return;
        }

        const robloxThumbnail = await invoke<string>("get_roblox_thumbnail", {
            userId: robloxProfile.id,
        }).catch((err) => new Error(err));
        if (robloxThumbnail instanceof Error) {
            modal.remove(mId);
            const _id = crypto.randomUUID();
            modal.add({
                id: _id,
                title: "Failed to fetch thumbnail",
                text: robloxThumbnail.message,
                buttons: [
                    {
                        text: "Okay",
                        onClick: () => modal.remove(_id),
                    },
                ],
            });
            return;
        }

        const newProfile: IProfile = {
            id: profile.id,
            name: nameRef.current[0] || null,
            cookie: cookieRef.current[0],
            userId: robloxProfile.id,
            displayName: robloxProfile.displayName,
            username: robloxProfile.name,
            thumbnail: robloxThumbnail.split("/")[3],
            note: noteRef.current[0],
            lastPlayedAt: profile.lastPlayedAt,
        };

        await updateProfile(newProfile);
        modal.remove(mId);
        destruct();
    }

    const style: CSSProperties = {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        minWidth: UI_STYLES.DIMENSIONS.MODAL_MIN_WIDTH,
        padding: UI_STYLES.SPACING.XLARGE,
        backgroundColor: UI_STYLES.COLORS.BACKGROUND_DARK,
        border: `1px solid ${UI_STYLES.COLORS.BORDER}`,
        borderRadius: UI_STYLES.DIMENSIONS.MODAL_BORDER_RADIUS,
        zIndex: 1,
    };

    const buttonContainerStyle: CSSProperties = {
        display: "flex",
        gap: UI_STYLES.SPACING.MEDIUM,
        marginTop: UI_STYLES.SPACING.TINY,
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
            <div style={style}>
                <Title>Edit Profile</Title>
                <Text>Please input your cookie.</Text>
                <Input
                    ref={cookieRef}
                    placeholder=".ROBLOSECURITY"
                    defaultValue={profile.cookie}
                />
                <Text>Please input a profile name. (optional)</Text>
                <Input
                    ref={nameRef}
                    placeholder="Profile: Nexus42"
                    defaultValue={profile.name ?? ""}
                />
                <Text>Please input a note. (optional)</Text>
                <Input
                    ref={noteRef}
                    placeholder="This is the default note."
                    defaultValue={profile.note}
                />
                <div style={buttonContainerStyle}>
                    <Button onClick={destruct}>Cancel</Button>
                    <Button onClick={importCookies}>Import</Button>
                    <Button onClick={update}>Save</Button>
                </div>
            </div>
            <div style={blurStyle} />
        </>
    );
}
