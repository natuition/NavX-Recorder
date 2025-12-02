import type { Project, ProjectType, Task } from "./types";

type ProjectTypeSpecification = {
  name: string;
  value: ProjectType;
  metas?: { required: boolean; name: string; label: string; type: string }[];
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
        hasCondition: true
      },
      {
        id: "2",
        slug: "record-area",
        instructions: [
          "Lancer la mesure en appuyant sur le bouton \"Démarrer\".",
          "Faites le tour complet de la zone pour laquelle vous souhaitez mesurer la surface.",
          "Une fois revenu au point de départ, la surface sera automatiquement calculée, il vous sera demandé de confirmer.",
        ],
        name: "Enregistrer une surface",
        measurementType: "area",
        completed: false,
        hasCondition: true
      }
    ]
  },
  CULTURE: {
    name: "Culture",
    value: "culture",
    metas: [
      { required: true, name: 'boardCount', label: 'Nombre de planches', type: 'number' },
      { required: true, name: 'cultureType', label: 'Type de culture', type: 'text' },
      { required: true, name: 'adventiceType', label: 'Adventice(s) à éliminer', type: 'text' },

    ],
    checklistTemplate: [
      {
        id: "1",
        name: "Distances entre les planches",
        instructions: [
          "Pour chaque ornière de la parcelle, mesurez 3 distances entre chaque planche.",
          "Essayez de mesurer perpendiculairement aux planches pour plus de précision.",
          "Pour enregistrer une distance, ajouter des points et appuyer sur le bouton 'Enregistrer'.",
        ],
        slug: "distance-entre-les-planches",
        measurementType: "distance",
        completed: false,
        hasCondition: true
      },
      {
        id: "2",
        name: "Surface de la parcelle",
        instructions: [
          "Lancer la mesure en appuyant sur le bouton \"Démarrer\".",
          "Faites le tour complet de la parcelle en vous assurant d'aligner le rover (antenne vers le haut) avec votre jambe qui longe la parcelle.",
          "Une fois revenu au point de départ, la surface sera automatiquement calculée, il vous sera demandé de confirmer.",
        ],
        slug: "surface-de-la-parcelle",
        measurementType: "area",
        completed: false,
        hasCondition: true
      },
      {
        id: "3",
        name: "Distance intra-plants",
        slug: "distance-intra-plants",
        instructions: [
          "Effectuer des mesures de distance entre les plants au sein d'une même rangée.",
          "Au minimum 3 mesures sont recommandées pour une meilleure précision.",
        ],
        measurementType: "distance",
        completed: false,
        hasCondition: true
      },
      {
        id: "4",
        name: "Distance inter-plants",
        slug: "distance-inter-plants",
        instructions: [
          "Effectuer des mesures de distance entre les plants de rangées adjacentes.",
          "Au minimum 3 mesures sont recommandées pour une meilleure précision.",
        ],
        measurementType: "distance",
        completed: false,
        hasCondition: true
      },
    ]
  },
};

export const TaskConditionResolvers: Record<string, (project: Project) => boolean> = {
  "record-distance": (project: Project) => {
    return project.measurements.some(
      (m) => m.type === "distance"
    );
  },

  "record-area": (project: Project) => {
    return project.measurements.some(
      (m) => m.type === "area"
    );
  },

  "distance-entre-les-planches": (project: Project) => {
    const boardCount = Number(project.meta?.boardCount);
    if (isNaN(boardCount) || boardCount <= 0) {
      console.warn("Invalid or missing boardCount meta in project.");
      return false;
    }
    const requiredDistances = boardCount * 3; // Par exemple, pour une parcelle de 3 planches il y a 9 distances à mesurer
    const distanceMeasurements = project.measurements.filter(
      (m) => m.type === "distance" && m.subject === "distance-entre-les-planches"
    );
    return distanceMeasurements.length >= requiredDistances;
  },

  "surface-de-la-parcelle": (project: Project) => {
    return project.measurements.some(
      (m) => m.type === "area" && m.subject === "surface-de-la-parcelle"
    );
  },

  "distance-intra-plants": (project: Project) => {
    const boardCount = Number(project.meta?.boardCount);
    if (isNaN(boardCount) || boardCount <= 0) {
      console.warn("Invalid or missing boardCount meta in project.");
      return false;
    }
    const requiredDistances = boardCount * 3;
    const intraPlantDistances = project.measurements.filter(
      (m) => m.type === "distance" && m.subject === "distance-intra-plants"
    );
    return intraPlantDistances.length >= requiredDistances;
  },

  "distance-inter-plants": (project: Project) => {
    const boardCount = Number(project.meta?.boardCount);
    if (isNaN(boardCount) || boardCount <= 0) {
      console.warn("Invalid or missing boardCount meta in project.");
      return false;
    }
    const interPlantDistances = project.measurements.filter(
      (m) => m.type === "distance" && m.subject === "distance-inter-plants"
    );
    const requiredDistances = boardCount * 3;
    return interPlantDistances.length >= requiredDistances;
  }
}

