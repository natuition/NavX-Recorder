import type { ProjectType, Task } from "./types";

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
  },
};;

