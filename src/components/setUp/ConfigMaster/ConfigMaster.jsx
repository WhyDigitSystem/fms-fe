import { useState } from "react";
import ConfigMasterList from "./ConfigMasterList";
import ConfigMasterForm from "./ConfigMasterForm";

export default function ConfigMaster() {
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
    setRefreshTrigger((previous) => previous + 1);
  };

  return (
    <>
      {screen === "list" ? (
        <ConfigMasterList
          onAdd={handleAdd}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <ConfigMasterForm data={editData} onBack={handleBack} />
      )}
    </>
  );
}
