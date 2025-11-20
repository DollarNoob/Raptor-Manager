import { motion } from "motion/react";
import { useFilterStore, useStore } from "../../store";
import type { IProfile } from "../../types/profile";
import Account from "./Account";
import AccountManager from "./AccountManager";

interface Props {
    children?: React.ReactNode;
}

export default function AccountList(_props: Props) {
    const store = useStore();
    const filter = useFilterStore();

    const style: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: 8,
    };

    const containerStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        overflowY: "scroll",
    };

    const filters: ((a: IProfile, b: IProfile) => number)[] = [
        (a, b) => parseInt(b.id, 36) - parseInt(a.id, 36), // Recently Added
        (a, b) => parseInt(a.id, 36) - parseInt(b.id, 36), // Least Recently Added
        (a, b) => b.lastPlayedAt - a.lastPlayedAt, // Recently Played
        (a, b) => a.lastPlayedAt - b.lastPlayedAt, // Least Recently Played
        (a, b) => a.displayName.localeCompare(b.displayName), // A to Z (Display Name)
        (a, b) => b.displayName.localeCompare(a.displayName), // Z to A (Display Name)
        (a, b) => a.username.localeCompare(b.username), // A to Z (Username)
        (a, b) => b.username.localeCompare(a.username), // Z to A (Username)
        (a, b) =>
            (a.name ?? `Profile: ${a.id}`).localeCompare(
                b.name ?? `Profile: ${b.id}`,
            ), // A to Z (Profile Name)
        (a, b) =>
            (b.name ?? `Profile: ${b.id}`).localeCompare(
                a.name ?? `Profile: ${a.id}`,
            ), // Z to A (Profile Name)
    ];

    return (
        <div style={style}>
            <AccountManager />
            <div style={containerStyle}>
                {store.profiles
                    .sort(filters[filter.filter])
                    .map((profile, i) => (
                        <motion.div
                            key={JSON.stringify(profile)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            style={{ width: "100%", minHeight: 64 }}
                        >
                            <Account
                                active={store.selectedIndex === i}
                                profile={profile}
                                state={
                                    store.states.find(
                                        (state) =>
                                            state.profileId === profile.id,
                                    ) ?? {
                                        profileId: profile.id,
                                        connected: false,
                                        pid: null,
                                        client: null,
                                        port: null,
                                    }
                                }
                                onClick={() =>
                                    store.setSelectedIndex(
                                        store.selectedIndex === i ? null : i,
                                    )
                                }
                            />
                        </motion.div>
                    ))}
            </div>
        </div>
    );
}
