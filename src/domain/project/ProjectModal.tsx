import type { CreateProjectFormType } from "./types";
import CreateProjectForm from "./ProjectForm";

type CreateProjectProps = {
  onCreated: (form: CreateProjectFormType) => void;
};

const CreateProjectModalContent = ({ onCreated }: CreateProjectProps) => {
  return (
    <div className="cmc-save">
      <h2 className="cmc-save__title">Nouveau projet</h2>
      <CreateProjectForm onSubmit={onCreated} />
    </div>
  );
};

type TaskInstructionsProps = {
  instructions: string[];
  images?: string[];
};

const TaskInstructionsModalContent = ({
  instructions,
  images,
}: TaskInstructionsProps) => {
  return (
    <>
      <ul className="cmc-task-instructions">
        {instructions.map((instruction, index) => (
          <li className="cmc-task-instructions__item" key={index}>
            {instruction}
          </li>
        ))}
      </ul>
      {/* // TODO: améliorer le rendu avec un carousel si plusieurs images */}
      {images && images.length > 0 && (
        <div>
          {images.map((imageSrc, index) => (
            <img
              className="cmc-task-instructions__image"
              key={index}
              src={imageSrc}
              alt={`Instruction ${index + 1}`}
            />
          ))}
        </div>
      )}
    </>
  );
};

const ProjectModal = {
  TaskInstructions: TaskInstructionsModalContent,
  CreateProject: CreateProjectModalContent,
};

export default ProjectModal;
