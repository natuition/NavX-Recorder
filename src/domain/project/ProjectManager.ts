import type { Store } from "../stores/Store";
import type { CreateProjectFormType, Measurement, Project, ProjectType, Task } from "./types";
import { ProjectTypesSpecifications, TaskConditionResolvers } from "./ProjectTypesSpecifications";


export class ProjectManager {
  private store: Store<Project>;

  constructor(store: Store<Project>) {
    this.store = store;
  }

  async getProject(id: string): Promise<Project | null> {
    return this.store.findById(id);
  }

  async createProject(form: CreateProjectFormType): Promise<Project> {
    const newProject: Project = {
      id: window.crypto.randomUUID(),
      name: form.name,
      description: form.description,
      type: form.type as ProjectType,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      measurements: [],
      checklist: this.createChecklistForProjectType(form.type as ProjectType),
      meta: form.meta,
    };
    await this.store.save(newProject);
    return newProject;
  }

  async saveProject(project: Project): Promise<void> {
    const now = Date.now();
    const existingProject = await this.store.findById(project.id);

    if (existingProject) {
      // Mode UPDATE : conserver createdAt et checklist existants
      project.updatedAt = now;
    } else {
      // Mode CREATE : initialiser createdAt et checklist
      project.createdAt = now;
      project.updatedAt = now;
      project.checklist = this.createChecklistForProjectType(project.type);
    }

    await this.store.save(project);
  }

  async updateChecklist(projectId: string, onTaskCompleted?: (task: Task) => void): Promise<void> {
    const updatedTasks: Task[] = [];
    const project = await this.getProject(projectId);
    if (!project) throw new Error(`Project with id ${projectId} not found`);

    // Mettre à jour la checklist en fonction des mesures enregistrées
    for (const task of project.checklist) {
      if (task.hasCondition && TaskConditionResolvers[task.slug]?.(project)) {
        task.completed = true;
        updatedTasks.push(task);
      }
    }

    await this.saveProject(project);

    for (const task of updatedTasks) {
      onTaskCompleted?.(task);
    }
  }


  async deleteProjectById(id: string): Promise<void> {
    await this.store.deleteById(id);
  }

  async listProjects(): Promise<Project[]> {
    if (this.store.list) return this.store.list();
    return [];
  }

  async addMeasurementToProject(projectId: string, measurement: Measurement): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) throw new Error(`Project with id ${projectId} not found`);
    project.updatedAt = Date.now();
    project.measurements.push(measurement);
    await this.saveProject(project);
  }

  private createChecklistForProjectType(type: ProjectType): Task[] {
    return ProjectTypesSpecifications[type.toUpperCase()]?.checklistTemplate || [];
  }
}
