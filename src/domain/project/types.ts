export type CreateProjectForm = Pick<Project, "name" | "description"> & {
  type: ProjectType | "placeholder";
};

export type MeasurementType = "distance" | "area";

export type Measurement = {
  id: string;
  name: string;
  subject?: string;
  type: MeasurementType;
  value: number;
  unit: string;
  points: [number, number][];
};

export type ProjectType = "generic" | "culture"; // Ajouter d'autres types pour des applications futures

export type Task = {
  id: string;
  name: string;
  slug: string;
  measurementType: MeasurementType;
  completed: boolean;
  condition: string;
  instructions?: string[];
  imagesForInstructions?: string[];
};

export type Project = {
  id: string;
  type: ProjectType;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  measurements: Measurement[];
  checklist: Task[];
};

