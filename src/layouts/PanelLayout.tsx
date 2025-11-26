import { Outlet } from "react-router";

/**
 * Layout pour les pages ordinaires (sans carte).
 */
const PanelLayout = () => {
  return (
    <section className="panel-layout">
      <Outlet />
    </section>
  );
};

export default PanelLayout;
