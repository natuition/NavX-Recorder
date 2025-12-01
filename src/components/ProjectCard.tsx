import { useContext } from "react";
import type { Project } from "../domain/project/types";
import Dropdown from "./Dropdown";
import ProjectsContext from "../pages/Projects";

type ProjectCardProps = {
  project: Project;
  onClick: (projectId: string) => void;
};

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const { actions } = useContext(ProjectsContext);

  const options = [
    {
      label: "Supprimer",
      action: () => actions.deleteProject(project),
    },
    {
      label: "Exporter",
      action: () => {
        // TODO:
        console.debug(`Exporting project...`, project);
      },
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
