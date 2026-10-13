import React, { useState } from "react";
import FinYearForm from "./FinyearForm";
import FinYearList from "./FinyearList";

const FinYear = () => {
  const [currentView, setCurrentView] = useState("list"); // "list", "form"
  const [selectedFinYear, setSelectedFinYear] = useState(null);
  const orgId = localStorage.getItem("orgId");

  const handleAddNew = () => {
    setSelectedFinYear(null);
    setCurrentView("form");
  };

  const handleEdit = (finYear) => {
    setSelectedFinYear(finYear);
    setCurrentView("form");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedFinYear(null);
  };

  const handleSaveSuccess = () => {
    handleBackToList();
  };

  return (
    <div>
      {currentView === "list" && (
        <FinYearList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          orgId={orgId}
          onBack={() => {}} // Not needed as we're using internal navigation
        />
      )}
      
      {currentView === "form" && (
        <FinYearForm
          onBack={handleBackToList}
          onSaveSuccess={handleSaveSuccess}
          editData={selectedFinYear}
          orgId={orgId}
        />
      )}
    </div>
  );
};

export default FinYear;