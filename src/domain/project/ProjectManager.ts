import type { Store } from "../stores/Store";
import type { Measurement, Project, ProjectType, Task } from "./types";

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
          { name: "Distances entre les planches", measurementType: "distance", completed: false, condition: "not-implemented" },
          { name: "Surface de la parcelle", measurementType: "area", completed: false, condition: "not-implemented" },
          { name: "Distance intra-rang", measurementType: "distance", completed: false, condition: "not-implemented" },
          { name: "Distance inter-rang", measurementType: "distance", completed: false, condition: "not-implemented" },
        ];
      case "generic":
        return [
          {
            name: "Enregistrer une distance",
            instructions: [
              "Assurez-vous de capturer au moins deux points GPS pour une mesure précise.",
            ],
            imagesForInstructions: ['/images/instruction_distance.example.png'],
            measurementType: "distance",
            completed: false,
            condition: 'has-some-distance'
          },
          {
            name: "Enregistrer une surface",
            measurementType: "area",
            completed: false,
            condition: 'has-some-surface'
          },
        ];
      default:
        return [];
    }
  }
}
