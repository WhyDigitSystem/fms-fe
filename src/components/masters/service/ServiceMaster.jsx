import { useState } from "react";
import ServiceMasterList from "./ServiceMasterList ";
import ServiceMasterForm from "./ServiceMasterForm";

export default function ServiceMaster() {
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
        <ServiceMasterList
          onAdd={handleAdd}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <ServiceMasterForm editData={editData} onBack={handleBack} />
      )}
    </>
  );
}
