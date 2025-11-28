import type { Project, Task } from "../domain/project/types";
import { FaRegCheckCircle, FaRegCircle } from "react-icons/fa";
import {} from "react-icons/fa";
import { useNavigate } from "react-router";

type ProjectChecklistProps = {
  project: Project;
};

const ProjectChecklist = ({ project }: ProjectChecklistProps) => {
  const navigate = useNavigate();

  const invokeTool = (task: Task) => {
    navigate(
      {
        pathname: `/${task.measurementType}`,
      },
      {
        state: {
          project,
          task: task,
          title: task.name,
        },
      }
    );
  };

  return (
    <ul className="checklist">
      {project.checklist.length > 0 ? (
        project.checklist.map((task, index) => (
          <li
            key={index}
            onClick={() => (!task.completed ? invokeTool(task) : null)}
            className={`checklist-item ${
              task.completed ? "checklist-item--completed" : ""
            }`}
          >
            {!task.completed ? (
              <FaRegCircle className="checklist-item__icon" />
            ) : (
              <FaRegCheckCircle className="checklist-item__icon" />
            )}
            <p className="checklist-item__content">
              Etape {index + 1} - {task.name}
            </p>
          </li>
        ))
      ) : (
        <p>Aucune tâche pour ce type de projet</p>
      )}
    </ul>
  );
};
export default ProjectChecklist;
