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
