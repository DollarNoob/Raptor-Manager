import Thumbnail from "./Thumbnail";
import Profile from "./Profile";
import Status from "./Status";
import { IProfile, IState } from "../../types";
import { useState } from "react";
import { Menu } from "@tauri-apps/api/menu";
import { useModalStore } from "../../store";
import { removeProfile } from "../../Utils";
import EditProfileModal from "../EditProfileModal";
import { invoke } from "@tauri-apps/api/core";

interface Props {
  active: boolean;
  profile: IProfile;
  state: IState;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
}

export default function Account({ active, profile, state, onClick }: Props) {
  const modal = useModalStore();
  const [ profileModal, setProfileModal ] = useState<React.ReactNode | null>(null);

  async function contextMenu(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    const menu = await Menu.new({
      items: [
        { id: "edit_profile", text: "Edit Profile", icon: "Remove", action: handleEvents },
        { id: "delete_profile", text: "Delete Profile", icon: "StopProgress", action: handleEvents },
        { id: "open_profile_folder", text: "Open Profile Folder", icon: "Folder", action: handleEvents }
      ]
    });
    menu.popup();
  }

  async function handleEvents(id: string) {
    switch (id) {
      case "edit_profile": {
        const destruct = () => setProfileModal(null);
        setProfileModal(<EditProfileModal profile={ profile } destruct={ destruct }/>);
        break;
      }
      case "delete_profile": {
        const id = crypto.randomUUID();
        modal.add({
          id,
          title: "Remove Profile",
          text: `Are you sure you want to delete '${profile.name ?? ("Profile: " + profile.id)}'?`,
          buttons: [
            {
              text: "No",
              onClick: () => modal.remove(id)
            },
            {
              text: "Yes",
              onClick: () => modal.remove(id) ?? removeProfile(profile.id)
            }
          ]
        });
        break;
      }
      case "open_profile_folder": {
        const open = await invoke<number>("open_profile_folder", { id: profile.id })
          .catch((err) => new Error(err));

        if (open instanceof Error) {
          const id = crypto.randomUUID();
          modal.add({
            id,
            title: "Failed to open profile folder",
            text: open.message,
            buttons: [
              {
                text: "Okay",
                onClick: () => modal.remove(id)
              }
            ]
          });
          return;
        }

        if (open !== 0) {
          const id = crypto.randomUUID();
          modal.add({
            id,
            title: "Failed to open profile folder",
            text: `Could not open profile folder with code ${open}.`,
            buttons: [
              {
                text: "Okay",
                onClick: () => modal.remove(id)
              }
            ]
          });
          return;
        }
        break;
      }
    }
  }

  const style: React.CSSProperties = {
    display: "flex",
    height: 44,
    gap: 10,
    backgroundColor: active ? "oklch(0.28 0 0)" : "inherit",
    padding: 10,
    borderRadius: 12,
    justifyContent: "space-between",
    cursor: "pointer"
  };

  const leftContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: 10
  };

  const rightContainerStyle: React.CSSProperties = {
    display: "flex",
    minWidth: "fit-content",
    alignItems: "center"
  };

  return (<>
    { profileModal }
    <div style={ style } onClick={ onClick } onContextMenu={ contextMenu }>
      <div style={ leftContainerStyle }>
        <Thumbnail thumbnail={ profile.thumbnail } size={ 44 }/>
        <Profile profile={ profile }/>
      </div>
      <div style={ rightContainerStyle }>
        <Status color={ state.connected ? "green" : "red" }>
          { state.connected ? (`${state.port ? `${state.client} ${state.port}` : state.client}`) : "Offline" }
        </Status>
      </div>
    </div>
  </>);
}
