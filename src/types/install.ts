export interface IInstallProgress {
    state:
        | "download-roblox"
        | "install-roblox"
        | "download-insert-dylib"
        | "install-insert-dylib"
        | "download-dylib"
        | "insert-dylib"
        | "apply-codesign"
        | "remove-codesign";
    progress: [number, number] | null;
}
