import type { Store } from "../stores/Store";
import type { CreateProjectFormType, Measurement, Project, ProjectType, Task } from "./types";
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

  async createProject(form: CreateProjectFormType): Promise<Project> {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: form.name,
      description: form.description,
      type: form.type as ProjectType,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      measurements: [],
      checklist: this.createChecklistForProjectType(form.type as ProjectType),
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
    project.updatedAt = Date.now();
    project.measurements.push(measurement);
    await this.saveProject(project);
  }

  private createChecklistForProjectType(type: ProjectType): Task[] {
    switch (type) {
      case "culture":
        return [
          {
            id: "1",
            name: "Distances entre les planches",
            instructions: [
              "Pour chaque rangée de la parcelle, mesurez 3 distances entre chaque planche.",
              "Essayez de mesurer perpendiculairement aux planches pour plus de précision.",
              "Ajouter vos points de mesure puis enregister la mesure en appuyant sur le bouton 'Enregistrer'.",
            ],
            slug: "distance-entre-les-planches",
            measurementType: "distance",
            completed: false,
            condition: "boards-distances-done"
          },
          {
            id: "2",
            name: "Surface de la parcelle",
            slug: "surface-de-la-parcelle",
            measurementType: "area",
            completed: false,
            condition: "parcel-area-done"
          },
          {
            id: "3",
            name: "Distance intra-rang",
            slug: "distance-intra-rangs",
            measurementType: "distance",
            completed: false,
            condition: "intra-raw-done"
          },
          {
            id: "4",
            name: "Distance inter-rang",
            slug: "distance-inter-rangs",
            measurementType: "distance",
            completed: false,
            condition: "inter-raw-done"
          },
        ];
      case "generic":
        return genericChecklist as Task[];
      default:
        return [];
    }
  }
}
