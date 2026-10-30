import { useState } from "react";
import PortMasterList from "./PortMasterList";
import PortMasterForm from "./PortMasterForm";

export default function PortMaster({ onBack }) {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdd = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (item) => {
    setEditData(item);
    setScreen("form");
  };

  // Back from Form to List
  const handleBackToList = () => {
    setScreen("list");
    setEditData(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Back from List to Previous Screen
  const handleBackToPrevious = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <>
      {screen === "list" && (
        <PortMasterList
          onAdd={handleAdd}
          onEdit={handleEdit}
          onBack={handleBackToPrevious}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <PortMasterForm data={editData} onBack={handleBackToList} />
      )}
    </>
  );
}
