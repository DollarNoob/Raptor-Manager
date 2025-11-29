import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { motion } from "motion/react";
import type React from "react";
import { useEffect, useRef } from "react";
import {
    COOKIE_PLACEHOLDER,
    DEFAULT_NOTE,
    DEFAULT_PROFILE_NAME,
} from "../../constants";
import { useModalStore } from "../../store";
import type { IProfile, IRobloxProfile } from "../../types/profile";
import { addProfile } from "../../utils";
import SharedButton from "../Shared/Button";
import Input from "../Shared/Input";
import Text from "./Text";
import Title from "./Title";

interface Props {
    destruct: () => void;
    children?: React.ReactNode;
}

export default function ProfileModal({ destruct }: Props) {
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

    async function createProfile() {
        if (!cookieRef.current || !nameRef.current || !noteRef.current) return;

        const mId = crypto.randomUUID();
        modal.add({
            id: mId,
            title: "Create Profile",
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

        const robloxThumbnail = await invoke<string | null>(
            "get_roblox_thumbnail",
            {
                userId: robloxProfile.id,
            },
        ).catch((err) => new Error(err));
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

        const id = Date.now().toString(36);
        const profile: IProfile = {
            id,
            name: nameRef.current[0] || null,
            cookie: cookieRef.current[0],
            userId: robloxProfile.id,
            displayName: robloxProfile.displayName,
            username: robloxProfile.name,
            thumbnail: robloxThumbnail ? robloxThumbnail.split("/")[3] : null,
            note: noteRef.current[0],
            lastPlayedAt: Date.now(),
        };

        await addProfile(profile);
        modal.remove(mId);
        destruct();
    }

    const style: React.CSSProperties = {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        transformOrigin: "center",
        display: "flex",
        flexDirection: "column",
        minWidth: 240,
        padding: 12,
        backgroundColor: "oklch(0.24 0 0)",
        border: "1px solid #FFFFFF20",
        borderRadius: 12,
        zIndex: 1,
    };

    const buttonContainerStyle: React.CSSProperties = {
        display: "flex",
        gap: 8,
        marginTop: 4,
    };

    const blurStyle: React.CSSProperties = {
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
                }}
            >
                <Title>Create Profile</Title>
                <Text>Please enter your cookie.</Text>
                <Input ref={cookieRef} placeholder={COOKIE_PLACEHOLDER} />
                <Text>Please enter the profile name. (optional)</Text>
                <Input ref={nameRef} placeholder={DEFAULT_PROFILE_NAME} />
                <Text>Please enter a note. (optional)</Text>
                <Input
                    ref={noteRef}
                    placeholder={DEFAULT_NOTE}
                    defaultValue={DEFAULT_NOTE}
                />
                <div style={buttonContainerStyle}>
                    <SharedButton variant="modal" onClick={destruct}>
                        Cancel
                    </SharedButton>
                    <SharedButton variant="modal" onClick={importCookies}>
                        Import
                    </SharedButton>
                    <SharedButton variant="modal" onClick={createProfile}>
                        Save
                    </SharedButton>
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
