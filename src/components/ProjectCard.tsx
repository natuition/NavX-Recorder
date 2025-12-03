import { useContext } from "react";
import type { Project } from "../domain/project/types";
import Dropdown, { type DropdownOption } from "./Dropdown";
import ProjectsContext from "../pages/Projects";
import { useModal } from "../hooks/useModal";
import ProjectModal from "../domain/project/ProjectModal";

type ProjectCardProps = {
  project: Project;
  onClick: (projectId: string) => void;
};

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const { actions } = useContext(ProjectsContext);
  const modal = useModal();

  const options: DropdownOption[] = [
    {
      label: "Modifier",
      status: "default",
      action: () =>
        modal.open({
          _render: () => (
            <ProjectModal.EditProject
              onEdited={(formData) => actions.editProject(project.id, formData)}
              project={project}
            />
          ),
          noLabel: "Annuler",
          onNo: modal.close,
        }),
    },
    {
      label: "Supprimer",
      status: "danger",
      action: () => actions.deleteProject(project),
    },
    {
      label: "Exporter",
      status: "default",
      action: () => actions.exportProject(project),
    },

    {
      label: "Log",
      status: "default",
      action: () => console.log(project),
    },
  ];

  return (
    <div
      key={project.id}
      className="project-card"
      onClick={() => onClick(project.id)}
    >
      <header className="project-card__header">
        <h2 className="project-card__title">{project.name}</h2>
        <Dropdown options={options} />
      </header>
      <p className="project-card__description">
        {project.description.length === 0
          ? "Aucune description"
          : project.description}
      </p>
      <p className="project-card__date">
        Mis à jour le {new Date(project.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default ProjectCard;
