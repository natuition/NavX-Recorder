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

  return (
    <>
      <h1 className="settings__title">Paramètres</h1>
      <section className="settings__section">
        <button className="button" onClick={handleNavxConnection}>
          {bluetoothConnected ? "Déconnecter" : "Connecter"} NavX
        </button>
      </section>
    </>
  );
};

export default Settings;
