import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { invoke } from "@tauri-apps/api/core";

export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  files: z.array(z.object({
    id: z.string(),
    name: z.string(),
    text: z.string(),
    output: z.string().optional(),
    attributes: z.object({
      lipsync: z.boolean().nullable().default(false),
      confidantPoint: z.boolean().nullable().default(false),
      boxType: z.string().nullable().default("MSG"),
      confidantId: z.number().nullable(),
      pointsGained: z.number().nullable(),
      modelId: z.number().nullable(),
      characterName: z.string().nullable(),
      characterCheckbox: z.boolean().nullable().default(false),
    }).nullable().default({
      confidantId: null,
      pointsGained: null, 
      modelId: null,
      lipsync: false,
      confidantPoint: false,
      boxType: "MSG",
      characterName: null,
      characterCheckbox: false
    }),
  })),
});

export type Project = z.infer<typeof projectSchema>;

export class ProjectManager {
  static async createProject(name: string, description?: string): Promise<Project> {
    const project: Project = {
      id: uuidv4(),
      name,
      description,
      created_at: new Date(),
      updated_at: new Date(),
      files: [],
    };

    await this.saveProject(project);
    return project;
  }

  static async saveProject(project: Project): Promise<void> {
    // Convert dates to ISO strings for serialization
    const serializedProject = {
      ...project,
      created_at: project.created_at,
      updated_at: project.updated_at,
    };

    await invoke('save_project', { project: serializedProject });
  }

  static async loadProjects(): Promise<Project[]> {
    const projects = await invoke<any[]>('load_projects');
    
    // Convert ISO strings back to Date objects
    return projects.map((project: any) => ({
      ...project,
      created_at: new Date(project.created_at),
      updated_at: new Date(project.updated_at),
    }));
  }

  static async getProject(projectId: string): Promise<Project | { error: string }> {
    const projects = await this.loadProjects();
    const project = projects.find((project) => project.id === projectId);
    
    if (!project) {
      return { error: "Project not found" };
    }
    
    return project;
  }

  static async deleteProject(projectId: string): Promise<void> {
    await invoke('delete_project', { projectId });
  }

  static async updateProject(project: Project): Promise<void> {
    await invoke('update_project', { project });
  }
}
