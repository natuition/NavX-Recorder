import TopBar from "../components/TopBar.tsx";

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <TopBar />
      {children}
    </>
  );
};

export default BaseLayout;
