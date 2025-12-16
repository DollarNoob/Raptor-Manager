export interface IInstallProgress {
    state:
        | "download-roblox"
        | "download-ipa"
        | "install-roblox"
        | "install-ipa"
        | "download-insert-dylib"
        | "install-insert-dylib"
        | "download-dylib"
        | "insert-dylib"
        | "convert-ipa"
        | "apply-codesign"
        | "remove-codesign";
    progress: [number, number] | null;
}
