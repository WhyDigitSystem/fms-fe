import React, { useState } from "react";
import FinYearForm from "./FinyearForm";
import FinYearList from "./FinyearList";

const FinYear = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedFinYear, setSelectedFinYear] = useState(null);

  const orgId = localStorage.getItem("orgId");

  // Add New
  const handleAddNew = () => {
    setSelectedFinYear(null);
    setCurrentView("form");
  };

  // Edit
  const handleEdit = (finYear) => {
    setSelectedFinYear(finYear);
    setCurrentView("form");
  };

  // Back to List from Form
  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedFinYear(null);
  };

  // Save Success
  const handleSaveSuccess = () => {
    handleBackToList();
  };

  return (
    <>
      {currentView === "list" && (
        <FinYearList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          orgId={orgId}
          onBack={onBack || (() => window.history.back())}
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
    </>
  );
};

export default FinYear;
