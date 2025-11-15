import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { useConfigStore, useContextStore, useModalStore, useStore } from "../../store";
import type { IProfile } from "../../types/profile";
import type { ICloseState, IState } from "../../types/state";
import { launchClient, stopClient } from "../../utils";
import LaunchIcon from "../icons/LaunchIcon";
import LoadingIcon from "../icons/LoadingIcon";
import StopIcon from "../icons/StopIcon";
import SharedButton from "../Shared/Button";
import BigUsername from "./BigUsername";
import Status from "../Shared/Status";
import Thumbnail from "./Thumbnail";
import ContextIcon from "../icons/ContextIcon";
import { setContext } from "../../utils/context";
import { IMessage } from "../../types/message";

interface Props {
    profile: IProfile | null;
    state: IState | null;
    children?: React.ReactNode;
}

export default function AccountInfo({ profile, state }: Props) {
    const store = useStore();
    const modal = useModalStore();
    const config = useConfigStore();
    const context = useContextStore();
    const [forceQuit, setForceQuit] = useState(false);

    useEffect(() => {
        const unlistenOpen = listen<IState>("client_open", (event) => {
            store.updateState(event.payload);
        });

        const unlistenClose = listen<ICloseState>("client_close", (event) => {
            store.updateState({
                profileId: event.payload.profileId,
                connected: false,
                pid: null,
                client: null,
                port: null,
            });

            if (!forceQuit && event.payload.exitCode !== 0) {
                const profile = store.profiles.find(
                    (profile) => profile.id === event.payload.profileId,
                );
                const id = crypto.randomUUID();
                modal.add({
                    id,
                    title:
                        profile?.name ??
                        `Profile: ${event.payload.profileId} Crashed`,
                    text: `Your client has crashed with code ${event.payload.exitCode}.`,
                    buttons: [
                        {
                            text: "Okay",
                            onClick: () => modal.remove(id),
                        },
                    ],
                });
            }
            setForceQuit(false);
        });

        return () => {
            unlistenOpen.then((unlisten) => unlisten());
            unlistenClose.then((unlisten) => unlisten());
        };
    }, [forceQuit, store.updateState, store.profiles, modal.add, modal.remove]);

    useEffect(() => {
        const unlisten = listen<IMessage>("message", (event) => {
            const id = crypto.randomUUID();
            modal.add({
                id,
                title: event.payload.title,
                text: event.payload.description,
                buttons: [
                    {
                        text: "Okay",
                        onClick: () => modal.remove(id),
                    },
                ],
            });
        });

        return () => {
            unlisten.then((unlisten) => unlisten());
        };
    }, [modal.add, modal.remove]);

    async function launch(client = config.config.client) {
        if (!profile || !state) return;

        // laucnhing the instance
        if (!state.connected && state.pid) return;

        if (state.connected) {
            setForceQuit(true);

            if (state.pid === null) {
                const id = crypto.randomUUID();
                modal.add({
                    id,
                    title: "Cannot stop client",
                    text: "PID is null, unable to stop the client.",
                    buttons: [
                        {
                            text: "Okay",
                            onClick: () => modal.remove(id),
                        },
                    ],
                });
                return;
            }

            const stopped = await stopClient(state.pid).catch(
                (err) => new Error(err),
            );
            if (stopped instanceof Error) {
                const id = crypto.randomUUID();
                modal.add({
                    id,
                    title: "Failed to stop client",
                    text: stopped.message,
                    buttons: [
                        {
                            text: "Okay",
                            onClick: () => modal.remove(id),
                        },
                    ],
                });
            }
        } else {
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
            } else if (!client) {
                const id = crypto.randomUUID();
                modal.add({
                    id,
                    title: "Client Selection",
                    text: "Please select a client to run!",
                    buttons: config.config.clients.map((client) => ({
                        text: client.name,
                        onClick: () => modal.remove(id) ?? launch(client.name),
                    })),
                });
                return;
            }

            setForceQuit(false);

            const launched = await launchClient(
                client,
                profile.id,
                profile.cookie,
            ).catch((err) => err);
            if (launched instanceof Error) {
                const id = crypto.randomUUID();
                modal.add({
                    id,
                    title: "Failed to launch client",
                    text: launched.message,
                    buttons: [
                        {
                            text: "Okay",
                            onClick: () => modal.remove(id),
                        },
                    ],
                });
                return;
            }

            if (client === "Vanilla") {
                (launched as IState).connected = true;
                (launched as IState).client = "Vanilla";
            }
            store.updateState(launched as IState);
        }
    }

    async function updateContext() {
        setContext(profile?.id ?? "");
    }

    const style: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        width: 260,
        padding: 10,
        backgroundColor: "oklch(0.22 0 0)",
        border: "1px solid #FFFFFF20",
        borderRadius: 12,
        justifyContent: "space-between",
    };

    const topContainerStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    };

    const bottomContainerStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
    };

    const launchColor = state?.connected
        ? "red"
        : state?.pid
          ? "darkgreen"
          : "green";
    const launchIcon = state?.connected ? (
        <StopIcon />
    ) : state?.pid ? (
        <LoadingIcon />
    ) : (
        <LaunchIcon />
    );
    const launchText = state?.connected
        ? "Stop"
        : state?.pid
          ? "Launching"
          : "Launch";

    return (
        <>
            {profile && state ? (
                <div style={style}>
                    <div style={topContainerStyle}>
                        <Status color={state.connected ? "green" : "red"}>
                            {state.connected
                                ? `${state.port ? `${state.client} ${state.port}` : state.client} | PID ${state.pid}`
                                : "Offline"}
                        </Status>
                        <Thumbnail thumbnail={profile.thumbnail} size={100} />
                        <BigUsername
                            displayName={profile.displayName}
                            username={profile.username}
                        />
                    </div>
                    <div style={bottomContainerStyle}>
                        {
                            state.client === "Hydrogen" && state.connected && state.pid &&
                                <SharedButton
                                    variant="main"
                                    color={context.id === profile.id ? "darkgreen" : "green"}
                                    cursor={context.id !== profile.id}
                                    icon={<ContextIcon />}
                                    onClick={() => updateContext()}
                                >
                                    Set Context
                                </SharedButton>
                        }
                        <SharedButton
                            variant="main"
                            color={launchColor}
                            cursor={state.connected || !state.pid}
                            icon={launchIcon}
                            onClick={() => launch()}
                        >
                            {launchText}
                        </SharedButton>
                    </div>
                </div>
            ) : null}
        </>
    );
}
