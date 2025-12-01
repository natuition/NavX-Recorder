import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import type { Project } from "../domain/project/types";
import { useProjectManager } from "../hooks/useProjectManager";
import ProjectChecklist from "../components/ProjectChecklist";
import { ProjectTypesSpecifications } from "../domain/project/ProjectTypesSpecifications";

const ProjectDetails = () => {
  const [project, setProject] = useState<Project | null>(null);
  const projectManager = useProjectManager();
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  // TODO: trouver un moyen de factoriser dans un hook utilitaire
  useEffect(() => {
    if (!location.state) {
      // Si on accède directement à la page sans état, revenir à l'accueil
      navigate("/", { replace: true });
      return;
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const fetchProject = async () => {
      const projectId = params.id;
      if (!projectId) return;

      const fetchedProject = await projectManager.getProject(projectId);
      setProject(fetchedProject);
    };
    fetchProject();
  }, [projectManager, params]);

  return (
    project && (
      <>
        <h1 className="page__title">{project.name}</h1>
        <section className="page__section">
          <h2 className="page__subtitle">Description</h2>
          <p>
            {project.description.length > 0
              ? project.description
              : "Aucune description"}
          </p>
        </section>
        <section className="page__section">
          <h2 className="page__subtitle">Checklist</h2>
          <ProjectChecklist project={project} />
        </section>
        {project.meta && (
          <section className="page__section">
            <h2 className="page__subtitle">A propos</h2>
            <ul>
              {ProjectTypesSpecifications[
                project.type.toUpperCase()
              ].metas?.map((meta) => (
                <li key={meta.name}>
                  <strong>{meta.label} : </strong>
                  {project.meta![meta.name] ?? "Non renseigné"}
                </li>
              ))}
            </ul>
          </section>
        )}
      </>
    )
  );
};

export default ProjectDetails;
