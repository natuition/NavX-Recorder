import { useNavigate } from "react-router";
import Modal from "../components/Modal";
import { useModal } from "../hooks/useModal";
import { useToast } from "../hooks/useToast";
import type { Project } from "../domain/project/types";
import { useProjectManager } from "../hooks/useProjectManager";
import { useEffect, useState } from "react";
import { MdCreateNewFolder } from "react-icons/md";

const Projects = () => {
  const projectManager = useProjectManager();
  const modal = useModal();
  const toast = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const fetchedProjects = await projectManager.listProjects();
      setProjects(fetchedProjects);
    };

    fetchProjects();
  }, [projectManager]);

  const handleNavigateToProject = (projectId: string) => {
    navigate(`/projects/${projectId}`, {
      state: { title: "Détails du projet", from: "/projects" },
    });
  };

  const handleCreateProject = () => {
    const handler = async (project: Project) => {
      try {
        await projectManager.saveProject(project);
      } catch (error) {
        console.error("Error saving project:", error);
        toast.error(
          `Erreur lors de la création du projet. Veuillez réessayer.`
        );
        modal.close();
        return;
      }

      modal.close();
      setProjects((prevProjects) => [...prevProjects, project]);
      toast.success(`Projet "${project.name}" créé.`);
    };

    modal.open({
      _render: () => (
        <Modal.CreateProject onCreated={handler} onCancel={modal.close} />
      ),
    });
  };

  return (
    <>
      <h1 className="page__title">
        Projets{" "}
        <button
          onClick={handleCreateProject}
          className="button button--neutral projects__create-button"
        >
          <MdCreateNewFolder size={28} />
        </button>
      </h1>
      <section className="page__section projects">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => handleNavigateToProject(project.id)}
            >
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
    </>
  );
};

export default Projects;
