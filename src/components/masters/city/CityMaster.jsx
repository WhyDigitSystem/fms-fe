import { useState } from "react";
import CityMasterList from "./CityMasterList";
import CityMasterForm from "./CityMasterForm";
import masterAPI from "../../../api/cityAPI";

const CityMaster = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list"); // list | add | edit
  const [selectedCity, setSelectedCity] = useState(null);

  const handleAddNew = () => {
    setSelectedCity(null);
    setCurrentView("add");
  };

  const handleEdit = async (city) => {
    try {
      // ✅ fresh fetch using the new cityById endpoint
      const full = await masterAPI.getCityById(city.id);
      setSelectedCity(full || city);
    } catch (err) {
      console.error("Failed to load city by id, using row data:", err);
      setSelectedCity(city);
    }
    setCurrentView("edit");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedCity(null);
  };

  const handleSave = () => {
    // Form already persisted via masterAPI.saveCity; just navigate back.
    handleBackToList();
  };

  return (
    <>
      {currentView === "list" && (
        <CityMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
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