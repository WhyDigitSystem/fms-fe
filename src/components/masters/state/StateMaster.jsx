import { useState } from "react";
import StateMasterList from "./StateMasterList";
import StateMasterForm from "./StateMasterForm";
import { stateAPI } from "../../../api/stateAPI";

const StateMaster = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list"); // "list" | "add" | "edit"
  const [selectedState, setSelectedState] = useState(null);

  const handleAddNew = () => {
    setSelectedState(null);
    setCurrentView("add");
  };

  const handleEdit = async (state) => {
    try {
      // Fetch fresh state by id (authoritative)
      const full = await stateAPI.getStateById(state.id);
      setSelectedState(full || state);
    } catch (err) {
      console.error("Failed to load state by id, using row data:", err);
      setSelectedState(state);
    }
    setCurrentView("edit");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedState(null);
  };

  const handleSave = () => {
    // Form already persisted via stateAPI.createState — just navigate back.
    handleBackToList();
  };

  return (
    <>
      {currentView === "list" && (
        <StateMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {(currentView === "add" || currentView === "edit") && (
        <StateMasterForm
          onBack={handleBackToList}
          onSave={handleSave}
          editData={selectedState}
        />
      )}
    </>
  );
};

export default StateMaster;