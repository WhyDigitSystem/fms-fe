import { useState } from "react";
import PortMasterList from "./PortMasterList";
import PortMasterForm from "./PortMasterForm";

export default function PortMaster() {
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

  const handleBack = () => {
    setScreen("list");
    setEditData(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      {screen === "list" ? (
        <PortMasterList
          onAdd={handleAdd}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <PortMasterForm data={editData} onBack={handleBack} />
      )}
    </>
  );
}
