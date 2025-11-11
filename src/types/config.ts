export interface IConfig {
    client: string | null;
    clients: IClient[];
    decompiler: string;
}

export interface IClient {
    name: string;
    version: string;
}
