import type { IClient } from "../../types/config";
import type {
    ICrypticVersion,
    IHydrogenVersion,
    IMacsploitVersion,
    IRobloxVersion,
} from "../../types/version";
import {
    CLIENT_NAME_VANILLA,
    CLIENT_NAME_MACSPLOIT,
    CLIENT_NAME_HYDROGEN,
    CLIENT_NAME_RONIX,
    CLIENT_NAME_CRYPTIC,
    STATUS_NOT_INSTALLED,
    CLIENT_NAME_DELTA,
} from "../../constants";
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
        | ICrypticVersion
        | string;
    thumbnail: string;
    href?: string;
    onInstall: (client: string) => void;
    onRemove: (client: string) => void;
    children?: React.ReactNode;
}

export default function Client({
    installation,
    version,
    thumbnail,
    href,
    onInstall,
    onRemove,
    children,
}: Props) {
    const client = children?.toString()?.replace(" iOS", "") ?? CLIENT_NAME_VANILLA;

    const currentVersion = installation?.version ?? null;
    let latestVersion = null;
    if (client === CLIENT_NAME_VANILLA) {
        latestVersion = (version as IRobloxVersion).version;
    } else if (client === CLIENT_NAME_MACSPLOIT) {
        latestVersion = (version as IMacsploitVersion).relVersion;
    } else if (client === CLIENT_NAME_HYDROGEN) {
        latestVersion =
            (version as IHydrogenVersion).macos.exploit_version ?? null;
    } else if (client === CLIENT_NAME_RONIX) {
        latestVersion =
            (version as IHydrogenVersion).macos.exploit_version ?? null;
    } else if (client === CLIENT_NAME_CRYPTIC) {
        latestVersion = (version as ICrypticVersion).Versions.Software;
    } else if (client === CLIENT_NAME_DELTA) {
        latestVersion = version;
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
                        : STATUS_NOT_INSTALLED}
                </Status>
            </div>
            <Thumbnail thumbnail={thumbnail} size={72} href={href} />
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
