import Modal from "../components/Modal";
import { useBluetooth } from "../hooks/useBluetooth";
import { useModal } from "../hooks/useModal";

const Settings = () => {
  const { bluetoothConnected, connectBluetooth, disconnectBluetooth } =
    useBluetooth();
  const modal = useModal();

  const handleNavxConnection = () => {
    if (bluetoothConnected) {
      modal.open({
        message: "Déconnecter le rover ?",
        yesLabel: true,
        noLabel: "Annuler",
        onYes: () => {
          disconnectBluetooth();
          modal.close();
        },
        onNo: () => {
          modal.close();
        },
      });
    } else {
      connectBluetooth();
    }
  };

  const handleTestModal1 = () => {
    modal.open({
      message: "Hello dev, are you okay?",
      yesLabel: true,
      noLabel: true,
      onYes: modal.close,
      onNo: modal.close,
    });
  };

  const handleTestModal2 = () => {
    modal.open({
      message: "Are you sure!?",
      yesLabel: true,
      noLabel: false,
      onYes: modal.close,
    });
  };

  const handleTestModal3 = () => {
    modal.open({
      _render: () => <Modal.SaveDistance distance={28} />,
      yesLabel: "Cool !",
      onYes: modal.close,
    });
  };

  return (
    <>
      <h1 className="page__title">Paramètres</h1>
      <section className="page__section">
        <h2>Général</h2>
        <button className="button" onClick={handleNavxConnection}>
          {bluetoothConnected ? "Déconnecter" : "Connecter"} NavX
        </button>
      </section>
      <section className="page__section">
        <h2>Outils développeur</h2>

        <button className="button" onClick={handleTestModal1}>
          Test Modal 1
        </button>
        <button className="button" onClick={handleTestModal2}>
          Test Modal 2
        </button>
        <button className="button" onClick={handleTestModal3}>
          Test Modal 3
        </button>
      </section>
    </>
  );
};

export default Settings;
