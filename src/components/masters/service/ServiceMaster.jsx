import { useState } from "react";
import ServiceMasterList from "./ServiceMasterList ";
import ServiceMasterForm from "./ServiceMasterForm";

export default function ServiceMaster({ onBack }) {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Add New
  const handleAdd = () => {
    setEditData(null);
    setScreen("form");
  };

  // Edit
  const handleEdit = (item) => {
    setEditData(item);
    setScreen("form");
  };

  // Back to List from Form
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
        <ServiceMasterList
          onAdd={handleAdd}
          onEdit={handleEdit}
          onBack={handleBackToPrevious}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <ServiceMasterForm data={editData} onBack={handleBackToList} />
      )}
    </>
  );
}
