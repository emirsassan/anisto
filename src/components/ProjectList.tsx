import { Component, createSignal, onMount, For, Show } from "solid-js";
import { ProjectManager, type Project } from "../lib/projectManagment";
import Modal from "./Modal";
import ContextMenuV2 from "./ContextMenu";
import { useProject } from "../context/projectProvider";

const ProjectList: Component = () => {
  const [projects, setProjects] = createSignal<Project[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = createSignal(false);
  const [isEditModalOpen, setEditModalOpen] = createSignal(false);
  const [newProjectName, setNewProjectName] = createSignal("");
  const [newProjectDesc, setNewProjectDesc] = createSignal("");
  const [selectedProjectId, setSelectedProjectId] = createSignal<string | null>(null);

  const [contextMenu, setContextMenu] = createSignal<{
    x: number;
    y: number;
    projectId: string;
  } | null>(null);

  onMount(async () => {
    await loadProjects();
  });

  const loadProjects = async () => {
    const loadedProjects = await ProjectManager.loadProjects();
    setProjects(loadedProjects);
  };

  const handleCreateProject = async () => {
    if (!newProjectName()) return;

    await ProjectManager.createProject(newProjectName(), newProjectDesc());
    await loadProjects();
    setCreateModalOpen(false);
    setNewProjectName("");
    setNewProjectDesc("");
  };

  const handleEditProject = async () => {
    if (!selectedProjectId()) return;

    const projectToUpdate = {
      id: selectedProjectId()!,
      name: newProjectName(),
      description: newProjectDesc(),
      created_at: projects().find(p => p.id === selectedProjectId())!.created_at,
      updated_at: new Date(),
      files: projects().find(p => p.id === selectedProjectId())!.files
    };

    await ProjectManager.updateProject(projectToUpdate);
    await loadProjects();
    setEditModalOpen(false);
  };

  const handleDeleteProject = async (project_id: string) => {
    await ProjectManager.deleteProject(project_id);
    await loadProjects();
  };

  const [_proj, { setProject }] = useProject();

  const handleLoadProject = async (project_id: string) => {
    localStorage.setItem("project_id", project_id);
    const project = await ProjectManager.getProject(project_id);
    if ('error' in project) return;
    setProject(project);
  };

  return (
    <div class="p-4 flex-1 flex-col" onClick={() => setContextMenu(null)}>
      <div class="flex-1 flex items-center justify-center flex-col gap-4">
        <p class="text-zinc-400 text-lg font-medium">No project selected</p>
        <p class="text-zinc-500 text-sm">Select a project to start editing</p>
        <button
          onClick={() => setCreateModalOpen(true)}
          class="bg-primary text-text px-4 py-2 hover:bg-primary/90 transition-colors"
        >
          New Project
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <For each={projects()}>
          {(project) => (
            <div
              class="relative bg-primary p-4 border border-zinc-800"
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, projectId: project.id });
              }}
            >
              <h3 class="text-lg font-medium text-text">{project.name}</h3>
              <p class="text-zinc-400 text-sm mt-1">{project.description}</p>
              <div class="mt-2 text-xs text-zinc-500">
                Created: {project.created_at.toLocaleDateString()}
              </div>

              <div class="absolute bottom-2 right-2">
                <button onClick={() => handleLoadProject(project.id)} class="absolute select-none bottom-1 right-1 bg-white text-background hover:bg-white/90 px-4 py-1 transition-colors">
                  Load
                </button>
              </div>

              <Show when={contextMenu()?.projectId === project.id}>
                <ContextMenuV2
                  x={contextMenu()?.x ?? 0}
                  y={contextMenu()?.y ?? 0}
                  actions={[
                    { label: "Delete", action: async () => await handleDeleteProject(project.id) },
                    { label: "Edit", action: async () => {
                      setSelectedProjectId(project.id);
                      setNewProjectName(project.name);
                      setNewProjectDesc(project.description ?? "");
                      setEditModalOpen(true);
                    },
                  },
                  ]}
                />
              </Show>
            </div>
          )}
        </For>
      </div>

      <Modal
        isOpen={isCreateModalOpen()}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Project"
      >
        <div class="p-4">
          <div class="mb-4">
            <label class="block text-sm text-text mb-1">Project Name</label>
            <input
              type="text"
              value={newProjectName()}
              onInput={(e) => setNewProjectName(e.currentTarget.value)}
              class="w-full bg-primary text-text p-2 border border-zinc-800 focus:outline-none"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm text-text mb-1">
              Description (optional)
            </label>
            <textarea
              value={newProjectDesc()}
              onInput={(e) => setNewProjectDesc(e.currentTarget.value)}
              class="w-full bg-primary text-text p-2 border border-zinc-800 focus:outline-none"
              rows={3}
            />
          </div>
          <button
            onClick={handleCreateProject}
            class="bg-primary text-text px-4 py-2 hover:bg-primary/90 transition-colors"
          >
            Create Project
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen()}
        onClose={() => setEditModalOpen(false)}
        title="Edit Project"
      >
        <div class="p-4">
          <div class="mb-4">
            <label class="block text-sm text-text mb-1">Project Name</label>
            <input
              type="text"
              value={newProjectName()}
              onInput={(e) => setNewProjectName(e.currentTarget.value)}
              class="w-full bg-primary text-text p-2 border border-zinc-800 focus:outline-none"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm text-text mb-1">
              Description (optional)
            </label>
            <textarea
              value={newProjectDesc()}
              onInput={(e) => setNewProjectDesc(e.currentTarget.value)}
              class="w-full bg-primary text-text p-2 border border-zinc-800 focus:outline-none"
              rows={3}
            />
          </div>
          <button
            onClick={handleEditProject}
            class="bg-primary text-text px-4 py-2 hover:bg-primary/90 transition-colors"
          >
            Confirm Changes
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectList;
