import { useState } from "react";
import { useFilterStore, useModalStore, useStore } from "../../store";
import { removeProfile } from "../../utils";
import { FILTERS } from "../../constants";
import FunnelIcon from "../icons/FunnelIcon";
import MinusIcon from "../icons/MinusIcon";
import PlusIcon from "../icons/PlusIcon";
import ProfileModal from "../ProfileModal";
import ManagerButton from "./ManagerButton";

interface Props {
    children?: React.ReactNode;
}

export default function AccountManager(_props: Props) {
    const store = useStore();
    const modal = useModalStore();
    const filter = useFilterStore();
    const [profileModal, setProfileModal] = useState<React.ReactNode | null>(
        null,
    );

    function onCreate() {
        const destruct = () => setProfileModal(null);
        setProfileModal(<ProfileModal destruct={destruct} />);
    }

    function onRemove() {
        if (store.selectedIndex === null) return;

        const profile = store.profiles[store.selectedIndex];
        const id = crypto.randomUUID();
        modal.add({
            id,
            title: "Remove Profile",
            text: `Are you sure you want to delete '${profile.name ?? `Profile: ${profile.id}`}'?`,
            buttons: [
                {
                    text: "No",
                    onClick: () => modal.remove(id),
                },
                {
                    text: "Yes",
                    onClick: () =>
                        modal.remove(id) ?? removeProfile(profile.id),
                },
            ],
        });
    }

    function onFilter() {
        filter.setFilter((filter.filter + 1) % filter.filterCount);
    }

    const style: React.CSSProperties = {
        display: "flex",
        marginBottom: 6,
        justifyContent: "space-between",
    };

    const leftContainerStyle: React.CSSProperties = {
        display: "flex",
        gap: 4,
    };

    return (
        <>
            {profileModal}
            <div style={style}>
                <div style={leftContainerStyle}>
                    <ManagerButton icon={<PlusIcon />} onClick={onCreate} />
                    <ManagerButton
                        active={store.selectedIndex !== null}
                        icon={<MinusIcon />}
                        onClick={onRemove}
                    />
                </div>
                <div style={leftContainerStyle}>
                    <ManagerButton icon={<FunnelIcon />} onClick={onFilter}>
                        {FILTERS[filter.filter]}
                    </ManagerButton>
                </div>
            </div>
        </>
    );
}
