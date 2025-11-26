import { Outlet } from "react-router";
import CurrentLocation from "../components/CurrentLocation";
import StatusBar from "../components/StatusBar";

export const MapLayout = () => {
  return (
    <>
      <StatusBar />
      <CurrentLocation />
      <Outlet />
    </>
  );
};
