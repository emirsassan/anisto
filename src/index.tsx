/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";
import { ProjectProvider } from "./context/projectProvider";
import { PortraitConfigProvider } from "./context/portraitConfigProvider";

render(
  () => (
    <ProjectProvider project={null}>
      <PortraitConfigProvider>
        <App />
      </PortraitConfigProvider>
    </ProjectProvider>
  ),
  document.getElementById("root") as HTMLElement
);
