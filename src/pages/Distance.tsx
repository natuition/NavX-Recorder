import { useEffect, useState } from "react";
import {
  Layer,
  Source,
  type LineLayerSpecification,
  type CircleLayerSpecification,
} from "react-map-gl/mapbox";
import type { FeatureCollection, LineString, Point } from "geojson";
import DistanceToolBar from "../components/DistanceToolBar";
import { Distance as DistanceTool } from "../utils/Distance";
import { useLocation, useNavigate } from "react-router";
import { useToast } from "../hooks/useToast";
import { useGeolocation } from "../hooks/useGeolocation";
import { useModal } from "../hooks/useModal";
import { useProjectManager } from "../hooks/useProjectManager";
import type { Measurement } from "../domain/project/types";
import ProjectModal from "../domain/project/ProjectModal";

type LonLat = [number, number]; // [longitude, latitude]

const Distance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const modal = useModal();
  const projectManager = useProjectManager();
  const { position } = useGeolocation();

  // TODO: factoriser dans un état unique
  const [gpsPoints, setGpsPoints] = useState<LonLat[]>([]);
  const [distances, setDistances] = useState<number[]>([]);

  useEffect(() => {
    // TODO: trouver un moyen de factoriser dans un hook utilitaire
    if (!location.state) {
      // Si on accède directement à la page sans état, revenir à l'accueil
      navigate("/", { replace: true });
      return;
    }

    /*
     Flag qui indique à la TopBar si elle doit afficher
     la modale de confirmation de perte de mesure en cours.
     */
    if (gpsPoints.length > 0) {
      location.state.measureActive = true;
    } else {
      location.state.measureActive = false;
    }
  }, [gpsPoints, location, navigate]);

  useEffect(() => {
    // Dans le cas dune tâche de projet, on ouvre une modale avec les explications de la tâche.
    const showInstructions = () => {
      if (location.state.task?.instructions) {
        console.debug("Opening modal with task instructions.");
        modal.open({
          _render: () => (
            <ProjectModal.TaskInstructions
              instructions={location.state.task?.instructions}
              images={location.state.task?.imagesForInstructions}
            />
          ),
          yesLabel: "J'ai compris",
          onYes: () => {
            modal.close();
          },
        });
      }
    };

    showInstructions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalDistance = () => {
    return distances.reduce((prev, current) => prev + current, 0);
  };

  const handleSave = () => {
    if (gpsPoints.length < 2) {
      console.warn("Add at least two GPS points to save the measurement.");
      return;
    }

    const newMeasurement: Measurement = {
      id: crypto.randomUUID() as string,
      name: "Distance inter-planches",
      type: "distance",
      value: totalDistance(),
      unit: "m",
      points: gpsPoints,
    };

    // Cas où l'outil de distance est utilisé dans le contexte d'un projet
    if (location.state?.project && location.state?.task) {
      const project = location.state.project;
      const task = location.state.task;

      modal.open({
        message: `Ajouter cette mesure au projet ${project.name} ?`,
        yesLabel: true,
        noLabel: "Annuler",
        onNo: modal.close,
        onYes: async () => {
          try {
            await projectManager.addMeasurementToProject(
              project.id,
              newMeasurement
            );
            await projectManager.updateChecklist(
              project.id,
              (taskCompleted) => {
                if (taskCompleted.name === task.name) {
                  navigate(-1);
                }
              }
            );
          } catch (error) {
            console.error("Error saving measurement to project:", error);
            toast.error(`Erreur lors de l'enregistrement. Veuillez réessayer.`);
            modal.close();
            return;
          }

          modal.close();
          setGpsPoints([]);
          setDistances([]);
          toast.success("Mesure ajoutée.");
        },
      });
      return;
    }

    // Cas générique, lorsque l'utilisateur utilise l'outil de distance hors contexte de projet
    modal.open({
      message: "Enregistrer cette mesure ?",
      yesLabel: true,
      noLabel: "Annuler",
      onNo: modal.close,
      onYes: () => {
        console.warn("Saving measurement:", newMeasurement);
        modal.close();
        setGpsPoints([]);
        setDistances([]);
        toast.success("Mesure enregistrée");
      },
    });
  };

  const handleAddGPSPointMock = () => {
    let newPoint: LonLat;
    if (gpsPoints.length === 0) {
      newPoint = [-1.1517, 46.1591];
    } else {
      const lastPoint = gpsPoints[gpsPoints.length - 1];
      newPoint = [
        lastPoint[0] + (Math.random() - 0.5) * 0.001,
        lastPoint[1] + (Math.random() - 0.5) * 0.001,
      ];
    }

    if (gpsPoints.length > 0) {
      const lastPoint = gpsPoints[gpsPoints.length - 1];

      const newDistance =
        DistanceTool.haversine(
          lastPoint[1],
          lastPoint[0],
          newPoint[1],
          newPoint[0]
        ) * 1000;

      setDistances((prev) => [...prev, newDistance]);
    }
    setGpsPoints((prev) => [...prev, newPoint]);
  };

  const handleAddGPSPoint = () => {
    if (!position) {
      console.warn("Position is not available, could not add GPS point.");
      toast.warn("Position GPS non disponible");
      return;
    }

    const newPoint: LonLat = [position.longitude, position.latitude];

    if (gpsPoints.length > 0) {
      const lastPoint = gpsPoints[gpsPoints.length - 1];

      const newDistance =
        // TODO: Utiliser turf.js pour le calcul de distance
        DistanceTool.haversine(
          lastPoint[1],
          lastPoint[0],
          newPoint[1],
          newPoint[0]
        ) * 1000; // TODO: configurable

      setDistances((prev) => [...prev, newDistance]);
    }
    setGpsPoints((prev) => [...prev, newPoint]);
  };

  const gpsPointsGeoJSON: FeatureCollection<Point> = {
    type: "FeatureCollection",
    features: gpsPoints.map((point, index) => ({
      type: "Feature",
      properties: { index },
      geometry: {
        type: "Point",
        coordinates: point,
      },
    })),
  };

  const gpsLineGeoJSON: FeatureCollection<LineString> = {
    type: "FeatureCollection",
    features:
      gpsPoints.length > 1
        ? [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: gpsPoints,
              },
            },
          ]
        : [],
  };

  return (
    <>
      <Source id="gps-points" type="geojson" data={gpsPointsGeoJSON}>
        <Layer {...gpsPointsLayer} />
      </Source>
      <Source id="gps-line" type="geojson" data={gpsLineGeoJSON}>
        <Layer {...gpsLineLayer} />
      </Source>
      <DistanceToolBar
        nbPoints={gpsPoints.length}
        distance={totalDistance()}
        onAdd={handleAddGPSPointMock}
        onRemoveLast={() => setGpsPoints((prev) => prev.slice(0, -1))}
        onSave={handleSave}
      />
    </>
  );
};

const gpsLineLayer: LineLayerSpecification = {
  id: "gps-line",
  type: "line",
  paint: {
    "line-color": "#005eff",
    "line-width": 3,
    "line-dasharray": [2, 2],
  },
  source: "gps-line",
};

const gpsPointsLayer: CircleLayerSpecification = {
  id: "gps-points",
  type: "circle",
  paint: {
    "circle-color": "#2dbf80",
    "circle-radius": 5,
  },
  source: "gps-points",
};

export default Distance;
