export interface IProfile {
    id: string;
    name: string | null;
    cookie: string;
    userId: number;
    displayName: string;
    username: string;
    thumbnail: string | null;
    note: string;
    lastPlayedAt: number;
}

export interface IRobloxProfile {
    id: number;
    name: string;
    displayName: string;
}
