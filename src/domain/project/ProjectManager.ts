import type { Store } from "../stores/Store";
import type { Measurement, Project, ProjectType, Task } from "./types";
import genericChecklist from './checklists/generic.json';

export class ProjectManager {
  private store: Store<Project>;
  // TODO: externaliser la définition des conditions de tâches
  private taskConditionResolvers: Record<string, (project: Project) => boolean> = {
    "has-some-distance": (project: Project) => {
      return project.measurements.some(
        (m) => m.type === "distance"
      );
    },

    "has-some-surface": (project: Project) => {
      return project.measurements.some(
        (m) => m.type === "area"
      );
    },

    "boards-distances-done": (project: Project) => {
      const requiredDistances = 9; // Par exemple, pour une parcelle de 3 planches il y a 9 distances à mesurer
      const distanceMeasurements = project.measurements.filter(
        (m) => m.type === "distance" && m.subject === "boards-distance"
      );
      return distanceMeasurements.length >= requiredDistances;
    },

    // Placeholder for future conditions
    "not-implemented": (_: Project) => {
      return false;
    },
  }

  constructor(store: Store<Project>) {
    this.store = store;
  }

  async getProject(id: string): Promise<Project | null> {
    return this.store.findById(id);
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
      if (this.taskConditionResolvers[task.condition]?.(project)) {
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
    project.measurements.push(measurement);
    await this.saveProject(project);
  }

  private createChecklistForProjectType(type: ProjectType): Task[] {
    switch (type) {
      case "culture":
        return [
          { id: "1", name: "Distances entre les planches", slug: "distance-entre-les-planches", measurementType: "distance", completed: false, condition: "boards-distances-done" },
          { id: "2", name: "Surface de la parcelle", measurementType: "area", completed: false, condition: "not-implemented" },
          { id: "3", name: "Distance intra-rang", measurementType: "distance", completed: false, condition: "not-implemented" },
          { id: "4", name: "Distance inter-rang", measurementType: "distance", completed: false, condition: "not-implemented" },
        ];
      case "generic":
        return genericChecklist as Task[];
      default:
        return [];
    }
  }
}
