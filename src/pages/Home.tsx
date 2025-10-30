import StatusBar from "../components/StatusBar";
import { useApp } from "../contexts/AppContext";
import BaseLayout from "../layouts/BaseLayout";
import { MapLayout } from "../layouts/MapLayout";
import Distance from "./Distance";

const Home = () => {
  const { currentTool } = useApp();

  return (
    <BaseLayout>
      <MapLayout>
        <StatusBar />
        {currentTool === "Distance" && <Distance />}
      </MapLayout>
    </BaseLayout>
  );
};

export default Home;
