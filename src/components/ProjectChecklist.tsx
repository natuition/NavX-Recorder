import type { Project } from "../domain/project/types";
import { FaRegCheckCircle, FaRegCircle } from "react-icons/fa";
import {} from "react-icons/fa";
import { useNavigate } from "react-router";

type ProjectChecklistProps = {
  project: Project;
};

const ProjectChecklist = ({ project }: ProjectChecklistProps) => {
  const projectType = "culture"; // Placeholder en attendant l'implémentation réelle
  const navigate = useNavigate();

  const invokeTool = () => {
    console.log(
      `Outil invoqué pour le projet ${project.id} de type ${projectType}`
    );
    console.log(location.pathname);
    navigate(
      {
        pathname: `/distance`,
      },
      {
        state: {
          project,
          title: "Distance inter-planches",
        },
      }
    );
  };

  return (
    <ul className="checklist">
      <li
        onClick={invokeTool}
        className="checklist-item checklist-item--completed"
      >
        <FaRegCheckCircle className="checklist-item__icon" />
        <p className="checklist-item__content">Surface de la culture</p>
      </li>
      <li className="checklist-item">
        <FaRegCircle className="checklist-item__icon" />
        <p className="checklist-item__content">
          Distance moyenne entre les planches
        </p>
      </li>
      <li className="checklist-item">
        <FaRegCircle className="checklist-item__icon" />
        <p className="checklist-item__content">Ecart inter-plant</p>
      </li>
      <li className="checklist-item">
        <FaRegCircle className="checklist-item__icon" />
        <p className="checklist-item__content">Ecart intra-plant</p>
      </li>
    </ul>
  );
};
export default ProjectChecklist;
