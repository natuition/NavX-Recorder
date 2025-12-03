import { useNavigate } from "react-router";
import { useModal } from "../hooks/useModal";
import { useToast } from "../hooks/useToast";
import type { CreateProjectFormType, Project } from "../domain/project/types";
import { useProjectManager } from "../hooks/useProjectManager";
import { createContext, useEffect, useState } from "react";
import { MdCreateNewFolder } from "react-icons/md";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../domain/project/ProjectModal";
import { featureCollection, lineString, polygon } from "@turf/helpers";
import { downloadJSON } from "../utils/misc";

type JSONExport<T> = Partial<T> & {
  data: GeoJSON.FeatureCollection;
};

type ProjectsStateType = {
  projects: Project[];
};

type ProjectsActionsType = {
  deleteProject: (project: Project) => Promise<void>;
  exportProject: (project: Project) => Promise<void>;
  // createProject: (project: Project) => Promise<void>;
};

type ProjectsContextType = {
  state: ProjectsStateType;
  actions: ProjectsActionsType;
};

const ProjectsContext = createContext<ProjectsContextType>({
  state: {
    projects: [],
  },
  actions: {
    deleteProject: async () => {},
    exportProject: async () => {},
    // createProject: async () => {},
  },
});

export const Projects = () => {
  const projectManager = useProjectManager();
  const modal = useModal();
  const toast = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const fetchedProjects = await projectManager.listProjects();
      setProjects(fetchedProjects);
    };

    fetchProjects();
  }, [projectManager]);

  const handleNavigateToProject = (projectId: string) => {
    navigate(`/projects/${projectId}`, {
      state: { title: "Détails du projet", from: "/projects" },
    });
  };

  const handleCreateProject = () => {
    modal.open({
      _render: () => <ProjectModal.CreateProject onCreated={createProject} />,
      noLabel: "Annuler",
      onNo: () => {
        modal.close();
      },
    });
  };

  const createProject = async (projectForm: CreateProjectFormType) => {
    try {
      const project: Project = await projectManager.createProject(projectForm);
      modal.close();
      setProjects((prevProjects) => [...prevProjects, project]);
      toast.success(`Projet "${project.name}" créé.`);
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(`Erreur lors de la création du projet. Veuillez réessayer.`);
      modal.close();
      return;
    }
  };

  const deleteProject = async (project: Project) => {
    modal.open({
      message: `Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?`,
      yesLabel: "Oui",
      noLabel: "Annuler",
      onYes: async () => {
        await projectManager.deleteProjectById(project.id);
        setProjects((prevProjects) =>
          prevProjects.filter((p) => p.id !== project.id)
        );
        toast.success(`Projet supprimé.`);
        modal.close();
      },
      onNo: () => {
        modal.close();
      },
    });
  };

  const exportProject = async (project: Project) => {
    const measurements = project.measurements.map((m) => {
      switch (m.type) {
        case "distance":
          return lineString(m.points, {
            id: m.id,
            type: m.type,
            subject: m.subject,
            value: m.value,
            unit: m.unit,
          });

        case "area":
          return polygon([m.points], {
            id: m.id,
            type: m.type,
            subject: m.subject,
            value: m.value,
            unit: m.unit,
          });

        default:
          console.error("Unknown measurement type:", m.type);
          toast.error("Erreur lors de l'exportation.");
      }
    });

    const exportedData: JSONExport<Project> = {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      meta: project.meta,
      data: featureCollection(measurements as GeoJSON.Feature[]),
    };

    downloadJSON(
      exportedData,
      `${project.name.replaceAll(" ", "_").toLowerCase()}.json`
    );
  };

  return (
    <ProjectsContext.Provider
      value={{ state: { projects }, actions: { deleteProject, exportProject } }}
    >
      <h1 className="page__title">
        Projets{" "}
        <button
          onClick={handleCreateProject}
          className="button button--neutral projects__create-button"
        >
          <MdCreateNewFolder size={28} />
        </button>
      </h1>
      <section className="page__section projects">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard
              project={project}
              key={project.id}
              onClick={handleNavigateToProject}
            />
          ))
        ) : (
          <p>Aucun projet</p>
        )}
      </section>
    </ProjectsContext.Provider>
  );
};

export default ProjectsContext;
