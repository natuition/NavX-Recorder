import { useEffect, useMemo, useState } from "react";
import {
  Layer,
  Source,
  type LineLayerSpecification,
  type CircleLayerSpecification,
  type FillLayerSpecification,
} from "react-map-gl/mapbox";
import AreaToolBar from "../components/AreaToolBar";
import { Distance } from "../utils/Distance";
import area from "@turf/area";
import { useLocation, useNavigate } from "react-router";
import { useToast } from "../hooks/useToast";
import { useGeolocation } from "../hooks/useGeolocation";
import { useModal } from "../hooks/useModal";
import ProjectModal from "../domain/project/ProjectModal";
import { lineStrings, points, polygon } from "@turf/helpers";
import type { Measurement } from "../domain/project/types";
import distance from "@turf/distance";
import { useProjectManager } from "../hooks/useProjectManager";
import length from "@turf/length";

type AreaPoint = {
  position: GeoJSON.Position;
  isCorner: boolean;
};

const DISTANCE_THRESHOLD_METERS = 1; // Seuil de distance minimale entre deux points GPS
const CLOSING_TOLERENCE_FACTOR = 2; // Facteur de tolérance pour la fermeture de la surface
const EXPECTED_CLOSING_DISTANCE_METERS =
  DISTANCE_THRESHOLD_METERS * CLOSING_TOLERENCE_FACTOR;
const UPDATE_INTERVAL_MILLISECONDS = 500; // Intervalle d'ajout de points GPS

const Area = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const modal = useModal();
  const projectManager = useProjectManager();
  const { positionRef } = useGeolocation();

  const [areaPoints, setAreaPoints] = useState<AreaPoint[]>([]);
  // const [corners, setCorners] = useState<GeoJSON.Position[]>([]);

  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Dans le cas d'une tâche de projet, on ouvre une modale avec les explications de la tâche.
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

  useEffect(() => {
    // TODO: trouver un moyen de factoriser dans un hook utilitaire
    if (!location.state) {
      // Si on accède directement à la page sans état, revenir à l'accueil
      navigate("/", { replace: true });
      return;
    }

    if (isRecording || areaPoints.length > 0) {
      location.state.measureActive = true;
    } else {
      location.state.measureActive = false;
    }
  }, [isRecording, location.state, areaPoints.length, navigate]);

  useEffect(() => {
    if (!isRecording) return;

    const intervalId = setInterval(() => {
      if (!positionRef.current) return;

      const newPoint: AreaPoint = {
        position: [positionRef.current.longitude, positionRef.current.latitude],
        isCorner: false,
      };

      setAreaPoints((prev) => {
        if (prev.length === 0) {
          return [newPoint];
        }

        const lastPoint = prev[prev.length - 1];
        const distance = Distance.equirectangular(
          lastPoint.position[1],
          lastPoint.position[0],
          newPoint.position[1],
          newPoint.position[0]
        );

        if (distance < DISTANCE_THRESHOLD_METERS) {
          return prev;
        }

        return [...prev, newPoint];
      });
    }, UPDATE_INTERVAL_MILLISECONDS);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRecording]);

  const handleAddCorner = () => {
    if (!positionRef.current) {
      console.warn("Position is not available, could not add GPS point.");
      toast.warn("Position GPS non disponible.");
      return;
    }

    if (!isRecording) {
      setIsRecording(true);
      toast.info("Enregistrement de la surface en cours.");
    }

    const newPoint: AreaPoint = {
      position: [positionRef.current.longitude, positionRef.current.latitude],
      isCorner: true,
    };

    setAreaPoints((prev) => [...prev, newPoint]);
  };

  // const _handleAddCornerMock = () => {
  //   let newPoint: AreaPoint;
  //   if (areaPoints.length === 0) {
  //     newPoint = {
  //       position: [2.3522, 48.8566],
  //       isCorner: true,
  //     };
  //   } else {
  //     const lastPoint = areaPoints[areaPoints.length - 1];
  //     newPoint = {
  //       position: [
  //         lastPoint.position[0] + (Math.random() - 0.5) * 0.01,
  //         lastPoint.position[1] + (Math.random() - 0.5) * 0.01,
  //       ],
  //       isCorner: true,
  //     };
  //   }
  //   if (!isRecording) {
  //     setIsRecording(true);
  //   }
  //   setAreaPoints((prev) => [...prev, newPoint]);
  // };

  const handleRemoveLastPoint = () => {
    // On enlève le dernier point et celui d'avant devient le dernier angle
    setAreaPoints((prev) => {
      if (prev.length < 2) return prev.slice(0, -1);

      const pts = prev.slice(0, -1); // retire le dernier
      const lastIndex = pts.length - 1;

      return pts.map((pt, index) =>
        index === lastIndex ? { ...pt, isCorner: true } : pt
      );
    });

    // On veut arrêter l'enregistrement quand on retire un point
    if (isRecording) {
      setIsRecording(false);
      toast.info(
        "Enregistrement de la surface en pause. Ajouter un point pour reprendre.",
        { duration: 4000 }
      );
    }
  };

  const handleSave = () => {
    const firstPoint = areaPoints[0];
    const lastPoint = areaPoints[areaPoints.length - 1];
    if (
      distance(firstPoint.position, lastPoint.position, { units: "meters" }) >
      EXPECTED_CLOSING_DISTANCE_METERS
    ) {
      console.error("Area is not closed.");
      toast.error(
        `La surface doit être fermée (le dernier point doit être à moins de ${EXPECTED_CLOSING_DISTANCE_METERS} mètres du premier).`,
        { duration: 5000 }
      );
      return;
    }

    if (areaPoints.length < 3) {
      console.error("Not enough points to form an area.");
      toast.error("Une surface doit comporter au moins 3 points distincts.");
      return;
    }

    const positions = areaPoints.map((pt) => pt.position);

    const newMeasurement: Measurement = {
      id: window.crypto.randomUUID() as string,
      name: location.state?.task?.name || "Mesure de surface",
      subject: location.state?.task.slug || null,
      type: "area",
      value: totalArea,
      unit: "square-meters",
      points: [...positions, positions[0]],
    };

    // Cas où l'outil de surface est utilisé dans le contexte d'un projet
    if (location.state?.project && location.state?.task) {
      const project = location.state.project;
      const task = location.state.task;

      modal.open({
        message: `Ajouter cette mesure (${newMeasurement.value.toFixed(
          1
        )} m²) au projet "${project.name}" ?`,
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
            toast.error("Erreur lors de l'enregistrement. Veuillez réessayer.");
            modal.close();
            return;
          }

          modal.close();
          setIsRecording(false);
          setAreaPoints([]);
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
        // TODO: sauvegarder la mesure quelque part
        console.warn("Saving measurement:", newMeasurement);
        modal.close();
        setAreaPoints([]);
        toast.success("Mesure enregistrée.");
      },
    });
  };

  const gpsCornersGeoJSON = useMemo(() => {
    const positions = areaPoints
      .filter((pt) => pt.isCorner)
      .map((pt) => pt.position);

    return points(positions);
  }, [areaPoints]);

  const gpsLineGeoJSON = useMemo(() => {
    const positions = areaPoints.map((pt) => pt.position);
    return lineStrings(
      areaPoints.length > 1 ? [[...positions, positions[0]]] : []
    );
  }, [areaPoints]);

  const gpsPolygonGeoJSON = useMemo(() => {
    const positions = areaPoints.map((pt) => pt.position);
    return polygon(areaPoints.length > 2 ? [[...positions, positions[0]]] : []);
  }, [areaPoints]);

  const cornerCount = useMemo(() => {
    return areaPoints.filter((pt) => pt.isCorner).length;
  }, [areaPoints]);

  const totalArea = useMemo(() => {
    if (areaPoints.length < 3) {
      return 0;
    }
    return area(gpsPolygonGeoJSON);
  }, [areaPoints, gpsPolygonGeoJSON]);

  const perimeter = useMemo(() => {
    if (areaPoints.length < 2) {
      return 0;
    }
    return length(gpsLineGeoJSON, { units: "meters" });
  }, [areaPoints, gpsLineGeoJSON]);

  const canSave = useMemo(() => {
    if (areaPoints.length < 3) {
      return false;
    }
    const firstPoint = areaPoints[0];
    const lastPoint = areaPoints[areaPoints.length - 1];
    if (
      distance(firstPoint.position, lastPoint.position, { units: "meters" }) >
      EXPECTED_CLOSING_DISTANCE_METERS
    ) {
      return false;
    }
    return true;
  }, [areaPoints]);

  return (
    <>
      <Source id="gps-line" type="geojson" data={gpsLineGeoJSON}>
        <Layer {...gpsLineLayer} />
      </Source>
      <Source id="gps-polygon" type="geojson" data={gpsPolygonGeoJSON}>
        <Layer {...gpsFillLayer} />
      </Source>
      <Source id="gps-corners" type="geojson" data={gpsCornersGeoJSON}>
        <Layer {...gpsPointsLayer} />
      </Source>
      <AreaToolBar
        onAdd={handleAddCorner}
        onRemoveLast={handleRemoveLastPoint}
        area={totalArea}
        corners={Math.max(0, cornerCount)}
        onSave={handleSave}
        unit="m²"
        isRecording={isRecording}
        canSave={canSave}
        perimeter={perimeter}
      />
    </>
  );
};

const gpsFillLayer: FillLayerSpecification = {
  id: "gps-polygon",
  type: "fill",
  paint: {
    "fill-color": "#7f00ff",
    "fill-opacity": 0.25,
  },
  source: "gps-polygon",
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
  id: "gps-corners",
  type: "circle",
  paint: {
    "circle-color": "#7f00ff",
    "circle-blur": 0.25,
    "circle-radius": 5,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 2,
  },
  source: "gps-corners",
};

export default Area;
