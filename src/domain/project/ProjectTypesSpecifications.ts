import type { Project, ProjectType, Task } from "./types";

type ProjectTypeSpecification = {
  name: string;
  value: ProjectType;
  formMetas?: { required: boolean; name: string; label: string; type: string }[];
  checklistTemplate?: Task[];
};

export const ProjectTypesSpecifications: Record<string, ProjectTypeSpecification> = {
  GENERIC: {
    name: "Générique",
    value: "generic",
    checklistTemplate: [
      {
        id: "1",
        name: "Enregistrer une distance",
        slug: "record-distance",
        instructions: [
          "Assurez-vous de capturer au moins deux points GPS pour une mesure précise."
        ],
        imagesForInstructions: ["/images/instruction_distance.example.png"],
        measurementType: "distance",
        completed: false,
        condition: "has-some-distance"
      },
      {
        id: "2",
        slug: "record-area",
        name: "Enregistrer une surface",
        measurementType: "area",
        completed: false,
        condition: "has-some-surface"
      }
    ]
  },
  CULTURE: {
    name: "Culture",
    value: "culture",
    formMetas: [
      { required: true, name: 'boardCount', label: 'Nombre de planches', type: 'number' },
    ],
    checklistTemplate: [
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
    ]
  },
};

export const TaskConditionResolvers: Record<string, (project: Project) => boolean> = {
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
    const boardCount = Number(project.meta?.boardCount) || 1;
    const requiredDistances = boardCount * 3; // Par exemple, pour une parcelle de 3 planches il y a 9 distances à mesurer
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

