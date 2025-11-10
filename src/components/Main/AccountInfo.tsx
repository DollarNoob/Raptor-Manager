import Thumbnail from "./Thumbnail";
import BigUsername from "./BigUsername";
import Status from "./Status";
import Button from "./Button";
import LaunchIcon from "./LaunchIcon";
import { listen } from "@tauri-apps/api/event";
import LoadingIcon from "./LoadingIcon";
import { useEffect, useState } from "react";
import StopIcon from "./StopIcon";
import { ICloseState, IProfile, IState } from "../../types";
import { launchClient, stopClient } from "../../Utils";
import { useConfigStore, useModalStore, useStore } from "../../store";
import StaticInfo from "./StaticInfo";

interface Props {
  profile: IProfile | null;
  state: IState | null;
  children?: React.ReactNode;
}

export default function AccountInfo({ profile, state }: Props) {
  const store = useStore();
  const modal = useModalStore();
  const config = useConfigStore();
  const [ forceQuit, setForceQuit ] = useState(false);

  useEffect(() => {
    const unlistenOpen = listen<IState>("client_open", (event) => {
      store.updateState(event.payload);
    });

    const unlistenClose = listen<ICloseState>("client_close", (event) => {
      store.updateState({
        profileId: event.payload.profileId,
        connected: false,
        pid: null,
        client: null,
        port: null
      });

      if (!forceQuit && event.payload.exitCode !== 0) {
        const profile = store.profiles.find(profile => profile.id === event.payload.profileId);
        const id = crypto.randomUUID();
        modal.add({
          id,
          title: profile?.name ?? ("Profile: " + event.payload.profileId) + " Crashed",
          text: `Your client has crashed with code ${event.payload.exitCode}.`,
          buttons: [
            {
              text: "Okay",
              onClick: () => modal.remove(id)
            }
          ]
        });
      }
      setForceQuit(false);
    });

    return () => {
      unlistenOpen.then((unlisten) => unlisten());
      unlistenClose.then((unlisten) => unlisten());
    };
  }, [ forceQuit ]);

  async function launch(client = config.config.client) {
    if (!profile || !state) return;
    if (!state.connected && state.pid) return; // launching

    if (state.connected) {
      setForceQuit(true);

      const stopped = await stopClient(state.pid!)
        .catch((err) => new Error(err));
      if (stopped instanceof Error) {
        const id = crypto.randomUUID();
        modal.add({
          id,
          title: "Failed to stop client",
          text: stopped.message,
          buttons: [
            {
              text: "Okay",
              onClick: () => modal.remove(id)
            }
          ]
        });
      }
    } else {
      if (config.config.clients.length === 0) {
        const id = crypto.randomUUID();
        modal.add({
          id,
          title: "No client installation found",
          text: "Please install a client from the settings tab before selecting one!",
          buttons: [
            {
              text: "Okay",
              onClick: () => modal.remove(id)
            }
          ]
        });
        return;
      } else if (!client) {
        const id = crypto.randomUUID();
        modal.add({
          id,
          title: "Client Selection",
          text: "Please select a client to run!",
          buttons: config.config.clients.map(client => 
            ({
              text: client.name,
              onClick: () => modal.remove(id) ?? launch(client.name)
            })
          )
        });
        return;
      }

      setForceQuit(false);

      const launched = await launchClient(client, profile.id, profile.cookie).catch(err => err);
      if (launched instanceof Error) {
        const id = crypto.randomUUID();
        modal.add({
          id,
          title: "Failed to launch client",
          text: launched.message,
          buttons: [
            {
              text: "Okay",
              onClick: () => modal.remove(id)
            }
          ]
        });
        return;
      }

      if (client === "Vanilla") {
        launched.connected = true;
        launched.client = "Vanilla";
      }
      store.updateState(launched);
    }
  }

  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: 260,
    padding: 10,
    backgroundColor: "oklch(0.22 0 0)",
    border: "1px solid #FFFFFF20",
    borderRadius: 12,
    justifyContent: "space-between"
  };

  const topContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  };

  const bottomContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "center"
  };

  const launchColor = state?.connected ? "red" : (state?.pid ? "darkgreen" : "green");
  const launchIcon = state?.connected ? <StopIcon/> : (state?.pid ? <LoadingIcon/> : <LaunchIcon/>);
  const launchText = state?.connected ? "Stop" : (state?.pid ? "Launching" : "Launch");

  return (<>
    {
      profile && state ?
        <div style={ style }>
          <div style={ topContainerStyle }>
            <Status color={ state.connected ? "green" : "red" }>{ state.connected ? (`${state.port ? `${state.client} ${state.port}` : state.client} | PID ${state.pid}`) : "Offline" }</Status>
            <Thumbnail thumbnail={ profile.thumbnail } size={ 100 }/>
            <BigUsername displayName={ profile.displayName } username={ profile.username }/>
          </div>
          <div style={ bottomContainerStyle }>
            <Button color={ launchColor } cursor={ state.connected || !state.pid } icon={ launchIcon } onClick={ () => launch() }>
              { launchText }
            </Button>
          </div>
        </div> :
        <StaticInfo/>
    }
  </>);
}
