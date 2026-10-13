import { useState } from "react";
import StateMasterList from "./StateMasterList";
import StateMasterForm from "./StateMasterForm";
import stateAPI from "../../../api/stateAPI";

const StateMaster = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list"); // "list", "add", "edit"
  const [selectedState, setSelectedState] = useState(null);

  const handleAddNew = () => {
    setSelectedState(null);
    setCurrentView("add");
  };

  const handleEdit = (state) => {
    setSelectedState(state);
    setCurrentView("edit");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedState(null);
  };

  const handleSave = async (payload) => {
    try {
      if (payload.id) {
        // Update existing state
        await stateAPI.createState(payload);
      } else {
        // Create new state
        await stateAPI.createState(payload);
      }
      handleBackToList();
    } catch (error) {
      console.error("Error saving state:", error);
      throw error;
    }
  };

  return (
    <>
      {currentView === "list" && (
        <StateMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack}
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