/* @refresh reload */
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import App from "./App";
import { ProjectProvider } from "./context/projectProvider";
import { PortraitConfigProvider } from "./context/portraitConfigProvider";
import "./App.css";
import SettingsPage from "./pages/SettingsPage";

render(
  () => (
    <ProjectProvider project={null}>
      <PortraitConfigProvider>
        <Router>
          <Route path={"/"} component={App} />
          <Route path={"/settings"} component={SettingsPage} />
        </Router>
      </PortraitConfigProvider>
    </ProjectProvider>
  ),
  document.getElementById("root") as HTMLElement
);
