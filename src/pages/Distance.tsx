import { useEffect, useMemo, useState } from "react";
import {
  Layer,
  Source,
  type LineLayerSpecification,
  type CircleLayerSpecification,
  type SymbolLayerSpecification,
} from "react-map-gl/mapbox";
import DistanceToolBar from "../components/DistanceToolBar";
import { useLocation, useNavigate } from "react-router";
import { useToast } from "../hooks/useToast";
import { useGeolocation } from "../hooks/useGeolocation";
import { useModal } from "../hooks/useModal";
import { useProjectManager } from "../hooks/useProjectManager";
import type { Measurement } from "../domain/project/types";
import ProjectModal from "../domain/project/ProjectModal";
import { lineStrings, points, type Units } from "@turf/helpers";
import distance from "@turf/distance";
import length from "@turf/length";
import { midpoint } from "@turf/midpoint";

export type UnitOption = {
  label: string;
  shortLabel?: string;
  value: Units;
};

type DistanceConfig = {
  unit: UnitOption;
};

const DEFAULT_CONFIG: DistanceConfig = {
  unit: { label: "mètre", shortLabel: "m", value: "meters" },
};

type LonLat = [number, number]; // [longitude, latitude]

const Distance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const modal = useModal();
  const projectManager = useProjectManager();
  const { position } = useGeolocation();

  const [gpsPoints, setGpsPoints] = useState<LonLat[]>([]);

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

  const handleSave = () => {
    if (gpsPoints.length < 2) {
      console.warn("Add at least two GPS points to save the measurement.");
      return;
    }

    const newMeasurement: Measurement = {
      id: window.crypto.randomUUID() as string,
      name: location.state?.task.name,
      subject: location.state?.task.slug,
      type: "distance",
      value: totalDistance,
      unit: DEFAULT_CONFIG.unit.value,
      points: gpsPoints,
    };

    // Cas où l'outil de distance est utilisé dans le contexte d'un projet
    if (location.state?.project && location.state?.task) {
      const project = location.state.project;
      const task = location.state.task;

      modal.open({
        message: `Ajouter cette mesure (${newMeasurement.value.toFixed(1)} ${
          DEFAULT_CONFIG.unit.shortLabel
        }) au projet "${project.name}" ?`,
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
                if (taskCompleted.id === task.id) {
                  navigate(-1);
                }
              }
            );
          } catch (error) {
            console.error("Error saving measurement to project:", error);
            toast.error(
              "Erreur lors de l'enregistrement. Veuillez réessayer."

            );
            modal.close();
            return;
          }

          modal.close();
          setGpsPoints([]);
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
        toast.success("Mesure enregistrée");
      },
    });
  };

  // const _handleAddGPSPointMock = () => {
  //   let newPoint: LonLat;
  //   if (gpsPoints.length === 0) {
  //     newPoint = [-1.1517, 46.1591];
  //   } else {
  //     const lastPoint = gpsPoints[gpsPoints.length - 1];
  //     newPoint = [
  //       lastPoint[0] + (Math.random() - 0.5) * 0.001,
  //       lastPoint[1] + (Math.random() - 0.5) * 0.001,
  //     ];
  //   }
  //   setGpsPoints((prev) => [...prev, newPoint]);
  // };

  const handleAddGPSPoint = () => {
    if (!position) {
      console.warn("Position is not available, could not add GPS point.");
      toast.warn("Position GPS non disponible");
      return;
    }
    const newPoint: LonLat = [position.longitude, position.latitude];
    setGpsPoints((prev) => [...prev, newPoint]);
  };

  const gpsPointsGeoJSON = useMemo(() => points(gpsPoints), [gpsPoints]);

  const gpsLineGeoJSON = useMemo(
    () => lineStrings(gpsPoints.length > 1 ? [gpsPoints] : []),
    [gpsPoints]
  );

  const totalDistance = useMemo(
    () => length(gpsLineGeoJSON, { units: DEFAULT_CONFIG.unit.value }),
    [gpsLineGeoJSON]
  );

  const midpointsGeoJSON = useMemo(() => {
    if (gpsPoints.length < 2) return points([]);

    const midCoords: LonLat[] = [];
    const distances: number[] = [];

    for (let i = 1; i < gpsPoints.length; i++) {
      const start: LonLat = gpsPoints[i - 1];
      const end: LonLat = gpsPoints[i];

      midCoords.push(midpoint(start, end).geometry.coordinates as LonLat);
      distances.push(
        distance(start, end, { units: DEFAULT_CONFIG.unit.value })
      );
    }

    const fc = points(midCoords);
    fc.features.forEach((f, i) => {
      f.properties = {
        distance: distances[i].toFixed(1),
        unit: DEFAULT_CONFIG.unit.shortLabel,
      };
    });

    return fc;
  }, [gpsPoints]);

  return (
    <>
      <Source id="gps-line" type="geojson" data={gpsLineGeoJSON}>
        <Layer {...gpsLineLayer} />
      </Source>
      <Source id="gps-points" type="geojson" data={gpsPointsGeoJSON}>
        <Layer {...gpsPointsLayer} />
      </Source>
      <Source id="midpoints" type="geojson" data={midpointsGeoJSON}>
        <Layer {...midpointsLayer} />
      </Source>

      <DistanceToolBar
        unit={DEFAULT_CONFIG.unit}
        nbPoints={gpsPoints.length}
        distance={totalDistance}
        onAdd={handleAddGPSPoint}
        onRemoveLast={() => setGpsPoints((prev) => prev.slice(0, -1))}
        onSave={handleSave}
      />
    </>
  );
};

const midpointsLayer: SymbolLayerSpecification = {
  id: "midpoints-text",
  type: "symbol",
  minzoom: 16,
  layout: {
    "text-field": ["concat", ["get", "distance"], " ", ["get", "unit"]],
    "text-size": ["interpolate", ["linear"], ["zoom"], 16, 12, 22, 16],
    "text-anchor": "center",
  },
  paint: {
    "text-color": "#000000",
    "text-halo-color": "#ffffff",
    "text-halo-width": 2,
  },
  source: "midpoints",
};

const gpsLineLayer: LineLayerSpecification = {
  id: "gps-line",
  type: "line",
  paint: {
    "line-color": "#7f00ff",
    "line-width": 1.5,
    "line-opacity": 0.8,
  },
  source: "gps-line",
};

const gpsPointsLayer: CircleLayerSpecification = {
  id: "gps-points",
  type: "circle",
  paint: {
    "circle-color": "#7f00ff",
    "circle-blur": 0.25,
    "circle-radius": 5,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 2,
  },
  source: "gps-points",
};

export default Distance;
