import { useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import Main from "./components/Main";
import Settings from "./components/Settings";
import { useTabStore } from "./store";
import { emit } from "@tauri-apps/api/event";

function App() {
    const tab = useTabStore();

    const tabs = [<Main key="main" />, <Settings key="settings" />];

    useEffect(() => {
        emit("ready");
    }, []);

    return (
        <>
            <Header />
            {tabs[tab.tab]}
        </>
    );
}

export default App;
