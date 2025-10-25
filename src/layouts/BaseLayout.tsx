import Tabs from "../components/Tabs.tsx";
import ToolBar from "../components/ToolBar.tsx";

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="base-layout">
      <div id="scrim" className="invisible"></div>
      <ToolBar />
      {children}
      <Tabs />
    </div>
  );
};

export default BaseLayout;
