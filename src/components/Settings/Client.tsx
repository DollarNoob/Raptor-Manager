import { IClient, IHydrogenVersion, IMacsploitVersion, IRobloxVersion } from "../../types";
import Button from "./Button";
import Status from "./Status";
import Text from "./Text";
import Thumbnail from "./Thumbnail";

interface Props {
  installation?: IClient;
  version: IRobloxVersion | IMacsploitVersion | IHydrogenVersion;
  thumbnail: string;
  onInstall: (client: string) => void;
  onRemove: (client: string) => void;
  children?: React.ReactNode;
}

export default function Client({ installation, version, thumbnail, onInstall, onRemove, children }: Props) {
  const currentVersion = installation?.version ?? null;
  let latestVersion = null;
  if (children === "Vanilla") {
    latestVersion = (version as IRobloxVersion).version;
  } else if (children === "MacSploit") {
    latestVersion = (version as IMacsploitVersion).relVersion;
  } else if (children === "Hydrogen") {
    latestVersion = (version as IHydrogenVersion).macos.exploit_version ?? null;
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
    alignItems: "center"
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    width: "100%",
    gap: 6,
    marginTop: 8
  };

  const client = children?.toString() ?? "Vanilla";

  return (<>
    <div style={ style }>
      <Status color={ installation ? (currentVersion === latestVersion ? "green" : "orange") : "red" }>{ installation ? ("v" + currentVersion) : "Not Installed" }</Status>
      <Text>{ children }</Text>
      <Thumbnail thumbnail={ thumbnail } size={ 72 }/>
      <div style={ buttonContainerStyle }>
        {
          installation ?
            (
              currentVersion === latestVersion ?
                <Button color="blue" onClick={ () => onInstall(client) }>Reinstall</Button> :
                <Button color="green" onClick={ () => onInstall(client) }>Update</Button>
            ) :
            <Button color="blue" onClick={ () => onInstall(client) }>Install</Button>
        }
        {
          installation &&
            <Button color="red" onClick={ () => onRemove(client) }>Remove</Button>
        }
      </div>
    </div>
  </>);
}
