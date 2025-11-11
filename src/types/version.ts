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