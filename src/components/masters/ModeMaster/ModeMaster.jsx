import { useState } from "react";
import ModeMasterList from "./ModeMasterList";
import ModeMasterForm from "./ModeMasterForm";

export default function ModeMaster() {
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
        <ModeMasterList
          onAdd={handleAdd}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <ModeMasterForm data={editData} onBack={handleBack} />
      )}
    </>
  );
}
