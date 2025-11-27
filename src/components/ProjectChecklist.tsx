import type { Project } from "../domain/project/types";
import { FaRegCheckCircle, FaRegCircle } from "react-icons/fa";
import {} from "react-icons/fa";

type ProjectChecklistProps = {
  project: Project;
};

const ProjectChecklist = ({ project }: ProjectChecklistProps) => {
  const projectType = "culture"; // Placeholder en attendant l'implémentation réelle

  return (
    <ul className="project-checklist">
      <li className="checklist-item">
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
