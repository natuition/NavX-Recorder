import { Outlet } from "react-router";

const PanelLayout = () => {
  return (
    <section className="panel-layout">
      <Outlet />
    </section>
  );
};

export default PanelLayout;
