/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";
import { ProjectProvider } from "./context/projectProvider";

render(
  () => (
    <ProjectProvider project={null}>
      <App />
    </ProjectProvider>
  ),
  document.getElementById("root") as HTMLElement
);
