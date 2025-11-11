import { useStore } from "../../store";
import AccountInfo from "./AccountInfo";
import AccountList from "./AccountList";

interface Props {
    children?: React.ReactNode;
}

export default function Main(_props: Props) {
    const store = useStore();

    const style: React.CSSProperties = {
        display: "flex",
        flexGrow: 1,
        gap: 12,
    };

    const selectedProfile =
        store.selectedIndex !== null
            ? store.profiles[store.selectedIndex]
            : null;
    const selectedState =
        store.states.find((state) => state.profileId === selectedProfile?.id) ??
        null;

    return (
        <main style={style}>
            <AccountInfo
                key={selectedProfile?.id ?? null}
                profile={selectedProfile}
                state={selectedState}
            />
            <AccountList />
        </main>
    );
}
