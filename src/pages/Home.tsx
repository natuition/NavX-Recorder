import StatusBar from "../components/StatusBar";
import { useApp } from "../contexts/AppContext";
import BaseLayout from "../layouts/BaseLayout";
import { MapLayout } from "../layouts/MapLayout";
import Distance from "./Distance";
import Surface from "./Surface";

const Home = () => {
  const { currentTool } = useApp();

  return (
    <BaseLayout>
      <MapLayout>
        <StatusBar />
        {currentTool === "Distance" && <Distance />}
        {currentTool === "Surface" && <Surface />}
      </MapLayout>
    </BaseLayout>
  );
};

export default Home;
