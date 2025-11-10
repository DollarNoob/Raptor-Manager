import "./App.css";
import Header from "./components/Header";
import Main from "./components/Main";
import Settings from "./components/Settings";
import { useTabStore } from "./store";

function App() {
  const tab = useTabStore();

  const tabs = [
    <Main/>,
    <Settings/>
  ];

  return (<>
    <Header/>
    {
      tabs[tab.tab]
    }
  </>);
}

export default App;
