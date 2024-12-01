import { Component, createSignal, onMount, For, Show } from "solid-js";
import { ProjectManager, type Project } from "../lib/projectManagment";
import Modal from "./Modal";
import ContextMenuV2 from "./ContextMenu";
import { useProject } from "../context/projectProvider";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { createStore } from "solid-js/store";

const ProjectList: Component = () => {
  const [projects, setProjects] = createSignal<Project[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = createSignal(false);
  const [isEditModalOpen, setEditModalOpen] = createSignal(false);
  const [selectedProjectId, setSelectedProjectId] = createSignal<string | null>(
    null
  );

  const [newProject, setNewProject] = createStore<{ name: string, description: string }>({
    name: "",
    description: ""
  })

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
    if (!newProject.name) return;

    await ProjectManager.createProject(newProject.name, newProject.description);
    await loadProjects();
    setCreateModalOpen(false);
    setNewProject({ name: "", description: "" });
  };

  const handleEditProject = async () => {
    if (!selectedProjectId()) return;

    const projectToUpdate = {
      id: selectedProjectId()!,
      name: newProject.name,
      description: newProject.description,
      created_at: projects().find((p) => p.id === selectedProjectId())!
        .created_at,
      updated_at: new Date(),
      files: projects().find((p) => p.id === selectedProjectId())!.files,
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
    if ("error" in project) return;
    setProject(project);
  };

  return (
    <div class="p-4 flex-1 flex-col" onClick={() => setContextMenu(null)}>
      <div class="flex-1 flex items-center justify-center flex-col gap-4">
        <p class="text-zinc-400 text-lg font-medium">No project selected</p>
        <p class="text-zinc-500 text-sm">Select a project to start editing</p>
        <Button onClick={() => setCreateModalOpen(true)}>New Project</Button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <For each={projects()}>
          {(project) => (
            <div
              class="relative bg-primary p-4 border border-zinc-800"
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  projectId: project.id,
                });
              }}
            >
              <h3 class="text-lg font-medium text-text">{project.name}</h3>
              <p class="text-zinc-400 text-sm mt-1">{project.description}</p>
              <div class="mt-2 text-xs text-zinc-500">
                Created: {project.created_at.toLocaleDateString()}
              </div>

              <div class="absolute bottom-2 right-2">
                <Button
                  size="sm"
                  variant="secondary"
                  class="absolute select-none bottom-1 right-1"
                  onClick={() => handleLoadProject(project.id)}
                >
                  Load
                </Button>
              </div>

              <Show when={contextMenu()?.projectId === project.id}>
                <ContextMenuV2
                  x={contextMenu()?.x ?? 0}
                  y={contextMenu()?.y ?? 0}
                  actions={[
                    {
                      label: "Delete",
                      action: async () => await handleDeleteProject(project.id),
                    },
                    {
                      label: "Edit",
                      action: async () => {
                        setSelectedProjectId(project.id);
                        setNewProject({ name: project.name, description: project.description ?? "" });
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
            <Input
              type="text"
              size="full"
              label="Project Name"
              value={newProject.name}
              onInput={(e) => setNewProject({ ...newProject, name: e.currentTarget.value })}
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm text-text mb-1">
              Description (optional)
            </label>
            <textarea
              value={newProject.description}
              onInput={(e) => setNewProject({ ...newProject, description: e.currentTarget.value })}
              class="w-full bg-primary text-text p-2 border border-zinc-800 focus:outline-none"
              rows={3}
            />
          </div>
          <Button onClick={handleCreateProject}>Create Project</Button>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen()}
        onClose={() => setEditModalOpen(false)}
        title="Edit Project"
      >
        <div class="p-4">
          <div class="mb-4">
            <Input
              type="text"
              label="Project Name"
              value={newProject.name}
              onInput={(e) => setNewProject({ ...newProject, name: e.currentTarget.value })}
              size="full"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm text-text mb-1">
              Description (optional)
            </label>
            <textarea
              value={newProject.description}
              onInput={(e) => setNewProject({ ...newProject, description: e.currentTarget.value })}
              class="w-full bg-primary text-text p-2 border border-zinc-800 focus:outline-none"
              rows={3}
            />
          </div>
          <Button onClick={handleEditProject}>Confirm Changes</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectList;
