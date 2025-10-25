import Tabs from "../components/Tabs.tsx";

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="base-layout">
      <div id="scrim" className="invisible"></div>
      {children}
      <Tabs />
    </div>
  );
};

export default BaseLayout;
