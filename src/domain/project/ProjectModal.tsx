import { useState, type ChangeEvent, type FormEvent } from "react";
import type { CreateProjectForm } from "./types";

type CreateProjectProps = {
  onCreated: (form: CreateProjectForm) => void;
  onCancel: () => void;
};

const CreateProject = ({ onCreated, onCancel }: CreateProjectProps) => {
  const [fields, setFields] = useState<CreateProjectForm>({
    name: "",
    description: "",
    type: "placeholder",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const form = {
      type: fields.type,
      name: fields.name,
      description: fields.description,
    };
    onCreated(form);
  };

  return (
    <div className="cmc-save">
      <h2 className="cmc-save__title">Nouveau projet</h2>
      <form onSubmit={handleSubmit}>
        <div className="form__field">
          <label htmlFor="projectName">Nom</label>
          <input
            type="text"
            name="name"
            id="projectName"
            onChange={handleChange}
            value={fields.name}
          />
        </div>
        <div className="form__field">
          <label htmlFor="projectDescription">Description</label>
          <textarea
            name="description"
            id="projectDescription"
            onChange={handleChange}
            value={fields.description}
          />
        </div>
        <div className="form__field">
          <label htmlFor="projectType">Type</label>
          <select
            onChange={handleChange}
            name="type"
            id="projectType"
            value={fields.type}
          >
            <option disabled value="placeholder">
              Choisir un type de projet
            </option>
            <option value="generic">Générique</option>
            <option value="culture">Culture</option>
          </select>
        </div>
        <button type="submit" className="button button--primary">
          Créer
        </button>
        <button
          onClick={onCancel}
          type="button"
          className="button button--neutral"
        >
          Annuler
        </button>
      </form>
    </div>
  );
};

type TaskInstructionsProps = {
  instructions: string[];
  images?: string[];
};

const TaskInstructions = ({ instructions, images }: TaskInstructionsProps) => {
  return (
    <>
      <ul>
        {instructions.map((instruction, index) => (
          <li key={index}>{instruction}</li>
        ))}
      </ul>
      {/* // TODO: améliorer le rendu avec un carousel si plusieurs images */}
      {images && images.length > 0 && (
        <div>
          {images.map((imageSrc, index) => (
            <img
              className="cmc-task-instruction__image"
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
  TaskInstructions,
  CreateProject,
};

export default ProjectModal;
