import Modal from "../components/Modal";
import { useModal } from "../hooks/useModal";
import { useToast } from "../hooks/useToast";

const reports = [
  {
    id: crypto.randomUUID(),
    name: "Relevé 1",
    description: "Description du relevé 1",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    measurements: [
      {
        id: crypto.randomUUID(),
        name: "Surface de la parcelle",
        type: "area",
        value: 42,
        unit: "m²",
        points: [
          [2.2945, 48.8584],
          [2.295, 48.8585],
          [2.2955, 48.8583],
        ],
      },
      {
        id: crypto.randomUUID(),
        name: "Distance inter-planche 1",
        type: "distance",
        value: 15,
        unit: "m",
        points: [
          [2.2945, 48.8584],
          [2.2955, 48.8583],
        ],
      },
      {
        id: crypto.randomUUID(),
        name: "Distance inter-planche 2",
        type: "distance",
        value: 15,
        unit: "m",
        points: [
          [2.2945, 48.8584],
          [2.2955, 48.8583],
        ],
      },
      {
        id: crypto.randomUUID(),
        name: "Distance inter-planche 3",
        type: "distance",
        value: 15,
        unit: "m",
        points: [
          [2.2945, 48.8584],
          [2.2955, 48.8583],
        ],
      },
      {
        id: crypto.randomUUID(),
        name: "Distance intra-plants",
        type: "distance",
        value: 0.5,
        unit: "m",
        points: [
          [2.2945, 48.8584],
          [2.295, 48.8585],
        ],
      },
      {
        id: crypto.randomUUID(),
        name: "Distance inter-plants",
        type: "distance",
        value: 0.5,
        unit: "m",
        points: [
          [2.2945, 48.8584],
          [2.295, 48.8585],
        ],
      },
    ],
  },
];

const Projects = () => {
  const modal = useModal();
  const toast = useToast();

  const handleCreateProject = () => {
    console.warn("Creating a new project...");
    modal.open({
      _render: () => <Modal.CreateProject />,
    });
  };

  return (
    <>
      <h1 className="page__title">Projets</h1>
      <section className="page__section projects">
        {reports.map((report) => (
          <div key={report.id} className="project-card">
            <h2 className="project-card__name">{report.name}</h2>
            <p className="project-card__description">{report.description}</p>
            <p className="project-card__date">
              Mis à jour le {new Date(report.updatedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </section>
      <footer>
        <button
          onClick={handleCreateProject}
          className="button button--primary"
        >
          Créer un projet
        </button>
      </footer>
    </>
  );
};

export default Projects;
