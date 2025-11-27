export type Measurement = {
  id: string;
  name: string;
  type: "distance" | "area";
  value: number;
  unit: string;
  points: [number, number][];
};

export type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  measurements: Measurement[];
};

