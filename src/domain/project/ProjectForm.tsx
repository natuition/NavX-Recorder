import {
  createContext,
  useContext,
  useState,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import type { CreateProjectFormType } from "./types";
import { ProjectTypesSpecifications } from "./ProjectTypesSpecifications";
import { cast } from "../../utils/string";
import { useToast } from "../../hooks/useToast";

type CreateProjectFormProps = {
  onSubmit: (form: CreateProjectFormType) => void;
};

const CreateProjectFormContext = createContext<{
  fields: CreateProjectFormType;
  setFields: Dispatch<SetStateAction<CreateProjectFormType>>;
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
  setFields: () => {},
  isValid: () => false,
  handleChange: () => {},
});

const CreateProjectForm = ({ onSubmit }: CreateProjectFormProps) => {
  const toast = useToast();
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
    if (!isValid()) {
      toast.error("Veuillez remplir tous les champs requis.");
      return;
    }
    onSubmit(fields);
  };

  return (
    <CreateProjectFormContext.Provider
      value={{ fields, setFields, isValid, handleChange }}
    >
      <form onSubmit={handleSubmit}>
        <Base />
        <Meta />
        <Submit />
      </form>
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
          autoComplete="off"
          required
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
          required
          onChange={handleChange}
          name="type"
          id="projectType"
          value={fields.type}
        >
          <option disabled value="placeholder">
            Choisir un type de projet
          </option>
          {Object.values(ProjectTypesSpecifications).map((specs) => {
            return (
              <option key={specs.value} value={specs.value}>
                {specs.name}
              </option>
            );
          })}
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

const Meta = () => {
  const { fields, setFields } = useContext(CreateProjectFormContext);

  if (fields.type === "placeholder") {
    return;
  }

  const handleMetaChange = (
    e: ChangeEvent<HTMLInputElement>,
    metaType: string
  ) => {
    const { name, value } = e.target;
    setFields((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        [name]: cast(value, metaType),
      },
    }));
  };

  return (
    <>
      {ProjectTypesSpecifications[fields.type.toUpperCase()].formMetas?.map(
        (meta) => (
          <div
            className={`form__field ${
              meta.required ? "form__field--required" : ""
            }`}
            key={meta.name}
          >
            <label htmlFor={meta.name}>{meta.label}</label>
            <input
              required={meta.required}
              type={meta.type}
              name={meta.name}
              id={meta.name}
              onChange={(e) => handleMetaChange(e, meta.type)}
            />
          </div>
        )
      )}
    </>
  );
};

CreateProjectForm.Base = Base;
CreateProjectForm.Submit = Submit;
CreateProjectForm.Meta = Meta;

export default CreateProjectForm;
