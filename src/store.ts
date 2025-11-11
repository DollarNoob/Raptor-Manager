import { create } from "zustand";
import type { IProfile } from "./types/profile";
import type { IState } from "./types/state";
import type { IModal } from "./types/modal";
import type { IConfig } from "./types/config";
import type { IRobloxVersion, IMacsploitVersion, IHydrogenVersion } from "./types/version";

export interface StoreState {
    profiles: IProfile[];
    states: IState[];
    addProfile: (profile: IProfile) => void;
    updateProfile: (profile: IProfile) => void;
    removeProfile: (id: string) => void;
    updateState: (state: IState) => void;
    selectedIndex: number | null;
    setSelectedIndex: (index: number | null) => void;
}

export const useStore = create<StoreState>()((set) => ({
    profiles: [],
    states: [],
    addProfile: (profile) =>
        set((state) => ({
            profiles: [...state.profiles, profile],
            states: [
                ...state.states,
                {
                    profileId: profile.id,
                    connected: false,
                    pid: null,
                    client: null,
                    port: null,
                },
            ],
        })),
    updateProfile: (newProfile) =>
        set((state) => ({
            profiles: state.profiles.map((p) =>
                p.id === newProfile.id ? newProfile : p,
            ),
        })),
    removeProfile: (id) =>
        set((state) => ({
            profiles: state.profiles.filter((profile) => profile.id !== id),
            states: state.states.filter((state) => state.profileId !== id),
        })),
    updateState: (newState) =>
        set((state) => ({
            states: state.states.map((s) =>
                s.profileId === newState.profileId ? newState : s,
            ),
        })),
    selectedIndex: null,
    setSelectedIndex: (index) => set(() => ({ selectedIndex: index })),
}));

export interface ModalState {
    modals: IModal[];
    add: (modal: IModal) => void;
    remove: (id: string) => void;
}

export const useModalStore = create<ModalState>()((set) => ({
    modals: [],
    add: (modal) => set((state) => ({ modals: [modal, ...state.modals] })),
    remove: (id) =>
        set((state) => ({
            modals: state.modals.filter((modal) => modal.id !== id),
        })),
}));

export interface ConfigState {
    config: IConfig;
    setConfig: (config: IConfig) => void;
}

export const useConfigStore = create<ConfigState>()((set) => ({
    config: { client: null, clients: [], decompiler: "medal" },
    setConfig: (config) => set(() => ({ config })),
}));

export interface VersionState {
    roblox: IRobloxVersion;
    macsploit: IMacsploitVersion;
    hydrogen: IHydrogenVersion;
    setRoblox: (version: IRobloxVersion) => void;
    setMacsploit: (version: IMacsploitVersion) => void;
    setHydrogen: (version: IHydrogenVersion) => void;
}

export const useVersionStore = create<VersionState>()((set) => ({
    roblox: {
        version: "",
        clientVersionUpload: "",
        bootstrapperVersion: "",
    },
    macsploit: {
        clientVersionUpload: "",
        appVersion: "",
        clientVersion: "",
        relVersion: "",
        channel: "",
        changelog: "",
    },
    hydrogen: {
        global: {
            globallogs: "",
        },
        windows: {},
        macos: {},
        ios: {},
        android: {},
    },
    setRoblox: (version) => set(() => ({ roblox: version })),
    setMacsploit: (version) => set(() => ({ macsploit: version })),
    setHydrogen: (version) => set(() => ({ hydrogen: version })),
}));

export interface TabState {
    tab: number;
    tabCount: number;
    setTab: (tab: number) => void;
}

export const useTabStore = create<TabState>()((set) => ({
    tab: 0,
    tabCount: 2,
    setTab: (tab) => set(() => ({ tab })),
}));

export interface FilterState {
    filter: number;
    filterCount: number;
    setFilter: (filter: number) => void;
}

export const useFilterStore = create<FilterState>()((set) => ({
    filter: 0,
    filterCount: 10,
    setFilter: (filter) => set(() => ({ filter })),
}));
