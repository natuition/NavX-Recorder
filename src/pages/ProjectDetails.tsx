import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

const ProjectDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // TODO: trouver un moyen de factoriser dans un hook utilitaire
  useEffect(() => {
    if (!location.state) {
      // Si on accède directement à la page sans état, revenir à l'accueil
      navigate("/", { replace: true });
      return;
    }
  }, [location.state, navigate]);

  return (
    <>
      <h1 className="page__title">Détails du projet</h1>
      <section className="page__section project-details">
        <p>Contenu du projet à implémenter...</p>
      </section>
    </>
  );
};

export default ProjectDetails;
