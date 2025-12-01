import {
  createContext,
  useContext,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import type { CreateProjectFormType, ProjectType } from "./types";

type CreateProjectFormProps = {
  children: ReactNode;
  onSubmit: (form: CreateProjectFormType) => void;
};

const CreateProjectFormContext = createContext<{
  fields: CreateProjectFormType;
  isValid: () => boolean;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}>({
  fields: {
    name: "",
    description: "",
    type: "placeholder",
  },
  isValid: () => false,
  handleChange: () => {},
});

const CreateProjectForm = ({ children, onSubmit }: CreateProjectFormProps) => {
  const [fields, setFields] = useState<CreateProjectFormType>({
    name: "",
    description: "",
    type: "placeholder",
  });

  const isValid = () =>
    fields.name.trim() !== "" && fields.type !== "placeholder";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(fields);
  };

  return (
    <CreateProjectFormContext.Provider
      value={{ fields, isValid, handleChange }}
    >
      <form onSubmit={handleSubmit}>{children}</form>
    </CreateProjectFormContext.Provider>
  );
};

const Base = () => {
  const { fields, handleChange } = useContext(CreateProjectFormContext);

  return (
    <>
      <div className="form__field form__field--required">
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
      <div className="form__field form__field--required">
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
    </>
  );
};

const Submit = () => {
  return (
    <button type="submit" className="button button--primary">
      Créer
    </button>
  );
};

const Meta = ({ type }: { type: ProjectType }) => {
  return (
    <>
      <p>Meta for typ {type}</p>
    </>
  );
};

CreateProjectForm.Base = Base;
CreateProjectForm.Submit = Submit;
CreateProjectForm.Meta = Meta;

export default CreateProjectForm;
