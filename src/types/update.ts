export interface IUpdate {
    current_version: string;
    version: string;
    date: number | null;
    target: string;
    download_url: string;
    signature: string;
    notes: string | null;
}
