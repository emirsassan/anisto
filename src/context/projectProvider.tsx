import { createSignal, JSX, useContext } from "solid-js";
import { ProjectContext } from "./projectContext";

export const ProjectProvider = (props: { children: JSX.Element, project: any | never }) => {
  const [project, setProject] = createSignal<any | never>(props.project || null);

  const proj = [
    project,
    {
      setProject: (proj: string) => {
        setProject(proj);
      }
    }
  ];

  return <ProjectContext.Provider value={proj}>{props.children}</ProjectContext.Provider>;
};

export const useProject = () => {
  return useContext(ProjectContext);
};

