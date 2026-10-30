import { useState } from "react";
import ModeMasterList from "./ModeMasterList";
import ModeMasterForm from "./ModeMasterForm";

export default function ModeMaster({ onBack }) {
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
        <ModeMasterList
          onAdd={handleAdd}
          onEdit={handleEdit}
          onBack={handleBackToPrevious}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <ModeMasterForm data={editData} onBack={handleBackToList} />
      )}
    </>
  );
}
