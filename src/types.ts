export interface IProfile {
    id: string;
    name: string | null;
    cookie: string;
    userId: number;
    displayName: string;
    username: string;
    thumbnail: string;
    note: string;
    lastPlayedAt: number;
}

export interface IState {
    profileId: string;
    connected: boolean;
    pid: number | null;
    client: string | null;
    port: number | null;
}

export interface ICloseState {
    profileId: string;
    pid: number;
    exitCode: number;
}

export interface IModal {
    id: string;
    title: string;
    text: string;
    buttons: IModalButton[];
}

export interface IModalButton {
    text: string;
    icon?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export interface IConfig {
    client: string | null;
    clients: IClient[];
    decompiler: string;
}

export interface IClient {
    name: string;
    version: string;
}

export interface IRobloxProfile {
    id: number;
    name: string;
    displayName: string;
}

export interface IRobloxVersion {
    version: string;
    clientVersionUpload: string;
    bootstrapperVersion: string;
}

export interface IMacsploitVersion {
    clientVersionUpload: string;
    appVersion: string;
    clientVersion: string;
    relVersion: string;
    channel: string;
    changelog: string;
}

export interface IHydrogenVersion {
    global: {
        globallogs: string;
    };
    windows: IHydrogenPlatformVersion;
    macos: IHydrogenPlatformVersion;
    ios: IHydrogenPlatformVersion;
    android: IHydrogenPlatformVersion;
}

export interface IHydrogenPlatformVersion {
    product?: string;
    exploit_version?: string;
    roblox_version?: string;
    changelog?: string;
}
