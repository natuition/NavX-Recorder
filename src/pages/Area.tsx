import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Layer,
  Source,
  type LineLayerSpecification,
  type CircleLayerSpecification,
  type FillLayerSpecification,
} from "react-map-gl/mapbox";
import type {
  FeatureCollection,
  Geometry,
  LineString,
  Point,
  Polygon,
} from "geojson";
import AreaToolBar from "../components/AreaToolBar";
import { Distance } from "../utils/Distance";
import area from "@turf/area";
import { useLocation, useNavigate } from "react-router";
import { useToast } from "../hooks/useToast";
import { useGeolocation } from "../hooks/useGeolocation";
import { useModal } from "../hooks/useModal";
import ProjectModal from "../domain/project/ProjectModal";
import { geometry, lineStrings, points, polygon } from "@turf/helpers";
import type { Measurement } from "../domain/project/types";

type LonLat = [number, number]; // [longitude, latitude]

const DISTANCE_THRESHOLD_METERS = 1; // Seuil de distance minimale entre deux points GPS
const UPDATE_INTERVAL_MILLISECONDS = 500; // Intervalle d'ajout de points GPS

const Area = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const modal = useModal();
  const { positionRef } = useGeolocation();

  const [gpsPoints, setGpsPoints] = useState<LonLat[]>([]);
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

    if (isRecording || gpsPoints.length > 0) {
      location.state.measureActive = true;
    } else {
      location.state.measureActive = false;
    }
  }, [isRecording, location.state, gpsPoints.length, navigate]);

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      if (!positionRef.current) {
        console.warn(
          "GPS position not available, cannot start recording area."
        );
        toast.warn("Position GPS non disponible.", { context: "measurement" });
        return;
      }
      setGpsPoints([]);
      setIsRecording(true);
    }
  };

  useEffect(() => {
    if (!isRecording) return;

    const intervalId = setInterval(() => {
      if (!positionRef.current) return;

      const newPoint: LonLat = [
        positionRef.current.longitude,
        positionRef.current.latitude,
      ];

      setGpsPoints((prev) => {
        if (prev.length === 0) {
          return [newPoint];
        }

        const lastPoint = prev[prev.length - 1];
        const distance = Distance.equirectangular(
          lastPoint[1],
          lastPoint[0],
          newPoint[1],
          newPoint[0]
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

  const handleSave = () => {
    console.log("Enregistrement de la mesure de surface");

    const newMeasurement: Measurement = {
      id: window.crypto.randomUUID() as string,
      name: "STUB:name",
      subject: "STUB:subject",
      type: "area",
      value: totalArea,
      unit: "square-meters",
      points: [...gpsPoints, gpsPoints[0]],
    };

    console.log("Nouvelle mesure créée :", newMeasurement);
  };

  const gpsPointsGeoJSON = useMemo(() => points(gpsPoints), [gpsPoints]);

  const gpsLineGeoJSON = useMemo(
    () =>
      lineStrings(gpsPoints.length > 1 ? [[...gpsPoints, gpsPoints[0]]] : []),
    [gpsPoints]
  );

  const gpsPolygonGeoJSON = useMemo(
    () => polygon(gpsPoints.length > 2 ? [[...gpsPoints, gpsPoints[0]]] : []),
    [gpsPoints]
  );

  const totalArea = useMemo(() => {
    if (gpsPoints.length < 3) {
      return 0;
    }
    const _polygon = geometry("Polygon", [gpsPoints]);
    return area(_polygon);
  }, [gpsPoints]);

  return (
    <>
      <Source id="gps-line" type="geojson" data={gpsLineGeoJSON}>
        <Layer {...gpsLineLayer} />
      </Source>
      <Source id="gps-polygon" type="geojson" data={gpsPolygonGeoJSON}>
        <Layer {...gpsFillLayer} />
      </Source>
      <Source id="gps-points" type="geojson" data={gpsPointsGeoJSON}>
        <Layer {...gpsPointsLayer} />
      </Source>
      <AreaToolBar
        area={totalArea}
        nbPoints={Math.max(0, gpsPoints.length - 1)}
        onSave={handleSave}
        unit="m²"
        onToggleRecording={handleToggleRecording}
        isRecording={isRecording}
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

export default Area;
