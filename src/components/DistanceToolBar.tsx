type DistanceToolBarProps = {
  onAdd: () => void;
};

const DistanceToolBar = ({ onAdd }: DistanceToolBarProps) => {
  return (
    <>
      <button className="btn btn--medium" onClick={() => onAdd()}>
        Ajouter un point
      </button>
      <button>Enregistrer la distance</button>
    </>
  );
};

export default DistanceToolBar;
