import type { CreateProjectFormType, Project } from "./types";
import CreateProjectForm from "./ProjectForm";
import { urlFor } from "../../utils/url";

type CreateProjectProps = {
  onCreated: (form: CreateProjectFormType) => void;
};

const CreateProjectModalContent = ({ onCreated }: CreateProjectProps) => {
  return (
    <div className="cmc-save">
      <h2 className="cmc-save__title">Nouveau projet</h2>
      <CreateProjectForm onSubmit={onCreated}>
        <CreateProjectForm.Base />
        <CreateProjectForm.Meta />
        <CreateProjectForm.Submit label="Créer" />
      </CreateProjectForm>
    </div>
  );
};

type EditProjectProps = {
  onEdited: (form: CreateProjectFormType) => void;
  project: Project;
};

const EditProjectModalContent = ({ onEdited, project }: EditProjectProps) => {
  const formData: CreateProjectFormType = {
    name: project.name,
    description: project.description,
    type: project.type,
    meta: project.meta,
  };
  return (
    <div className="cmc-save">
      <h2 className="cmc-save__title">Modifier le projet</h2>
      <CreateProjectForm onSubmit={onEdited} formData={formData}>
        <CreateProjectForm.Base disabledFields={["type"]} />
        <CreateProjectForm.Submit label="Enregistrer" />
      </CreateProjectForm>
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
              src={urlFor(imageSrc)}
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
  EditProject: EditProjectModalContent,
};

export default ProjectModal;
