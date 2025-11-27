import type { Store } from "../stores/Store";
import type { Measurement, Project } from "./types";

export class ProjectManager {
  private store: Store<Project>;

  constructor(store: Store<Project>) {
    this.store = store;
  }

  async getProject(id: string): Promise<Project | null> {
    return this.store.findById(id);
  }

  async saveProject(project: Project): Promise<void> {
    const now = Date.now();
    project.updatedAt = now;
    if (!project.createdAt) project.createdAt = now;
    await this.store.save(project);
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
    project.measurements.push(measurement);
    await this.saveProject(project);
  }
}
