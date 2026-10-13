import { useState } from "react";
import CityMasterList from "./CityMasterList";
import CityMasterForm from "./CityMasterForm";
import masterAPI from "../../../api/cityAPI";

const CityMaster = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list"); // "list", "add", "edit"
  const [selectedCity, setSelectedCity] = useState(null);

  const handleAddNew = () => {
    setSelectedCity(null);
    setCurrentView("add");
  };

  const handleEdit = (city) => {
    setSelectedCity(city);
    setCurrentView("edit");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedCity(null);
  };

  const handleSave = async (payload) => {
    try {
      if (payload.id) {
        // Update existing city
        await masterAPI.saveCity(payload);
      } else {
        // Create new city
        await masterAPI.saveCity(payload);
      }
      handleBackToList();
    } catch (error) {
      console.error("Error saving city:", error);
      throw error;
    }
  };

  return (
    <>
      {currentView === "list" && (
        <CityMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack}
        />
      )}
      
      {(currentView === "add" || currentView === "edit") && (
        <CityMasterForm
          onBack={handleBackToList}
          onSave={handleSave}
          editData={selectedCity}
        />
      )}
    </>
  );
};

export default CityMaster;