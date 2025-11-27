import Modal from "../components/Modal";
import { useModal } from "../hooks/useModal";
import { useToast } from "../hooks/useToast";

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

const projects: Project[] = [];

const Projects = () => {
  const modal = useModal();
  const toast = useToast();

  const handleCreateProject = () => {
    console.debug("Creating a new project...");
    const handler = (project: Project) => {
      // TODO: Implémenter la sauvegarde réelle
      projects.push(project);

      modal.close();
      toast.success(`Projet "${project.name}" créé avec succès !`);
    };

    modal.open({
      _render: () => (
        <Modal.CreateProject onCreated={handler} onCancel={modal.close} />
      ),
    });
  };

  return (
    <>
      <h1 className="page__title">Projets</h1>
      <section className="page__section projects">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.id} className="project-card">
              <h2 className="project-card__name">{project.name}</h2>
              <p className="project-card__description">{project.description}</p>
              <p className="project-card__date">
                Mis à jour le {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p>Aucun projet</p>
        )}
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
