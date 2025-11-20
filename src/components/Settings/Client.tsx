import type { IClient } from "../../types/config";
import type {
    ICrypticVersion,
    IHydrogenVersion,
    IMacsploitVersion,
    IRobloxVersion,
} from "../../types/version";
import TrashIcon from "../icons/TrashIcon";
import Button from "../Shared/Button";
import Status from "../Shared/Status";
import Text from "./Text";
import Thumbnail from "./Thumbnail";

interface Props {
    installation?: IClient;
    version:
        | IRobloxVersion
        | IMacsploitVersion
        | IHydrogenVersion
        | ICrypticVersion;
    thumbnail: string;
    onInstall: (client: string) => void;
    onRemove: (client: string) => void;
    children?: React.ReactNode;
}

export default function Client({
    installation,
    version,
    thumbnail,
    onInstall,
    onRemove,
    children,
}: Props) {
    const currentVersion = installation?.version ?? null;
    let latestVersion = null;
    if (children === "Vanilla") {
        latestVersion = (version as IRobloxVersion).version;
    } else if (children === "MacSploit") {
        latestVersion = (version as IMacsploitVersion).relVersion;
    } else if (children === "Hydrogen") {
        latestVersion =
            (version as IHydrogenVersion).macos.exploit_version ?? null;
    } else if (children === "Ronix") {
        latestVersion =
            (version as IHydrogenVersion).macos.exploit_version ?? null;
    } else if (children === "Cryptic") {
        latestVersion = (version as ICrypticVersion).Versions.Software;
    }

    const style: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flex: 1,
        height: "fit-content",
        padding: 12,
        border: "1px solid #FFFFFF20",
        borderRadius: 12,
        alignItems: "center",
    };

    const containerStyle: React.CSSProperties = {
        display: "flex",
        gap: 0,
        alignItems: "center",
    };

    const buttonContainerStyle: React.CSSProperties = {
        display: "flex",
        width: "100%",
        gap: 6,
        marginTop: 8,
    };

    const client = children?.toString() ?? "Vanilla";

    return (
        <div style={style}>
            <div style={containerStyle}>
                <Text>{children}</Text>
                <Status
                    color={
                        installation
                            ? currentVersion === latestVersion
                                ? "green"
                                : "orange"
                            : "red"
                    }
                >
                    {installation && currentVersion
                        ? `v${currentVersion.replace("Version-", "")}`
                        : "Not Installed"}
                </Status>
            </div>
            <Thumbnail thumbnail={thumbnail} size={72} />
            <div style={buttonContainerStyle}>
                {installation ? (
                    currentVersion === latestVersion ? (
                        <Button
                            variant="settings"
                            color="blue"
                            onClick={() => onInstall(client)}
                        >
                            Reinstall
                        </Button>
                    ) : (
                        <Button
                            variant="settings"
                            color="green"
                            onClick={() => onInstall(client)}
                        >
                            Update
                        </Button>
                    )
                ) : (
                    <Button
                        variant="settings"
                        color="blue"
                        onClick={() => onInstall(client)}
                    >
                        Install
                    </Button>
                )}
                {installation && (
                    <Button
                        variant="settings"
                        color="red"
                        style={{ maxWidth: 30 }} // square
                        icon={<TrashIcon />}
                        onClick={() => onRemove(client)}
                    />
                )}
            </div>
        </div>
    );
}
