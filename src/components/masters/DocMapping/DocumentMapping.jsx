import React, { useState } from "react";
import DocumentMappingForm from "./DocumentMappingForm";
import DocumentMappingList from "./DocumentMappingList";

const DocumentMapping = ({ onBack }) => {
  const [theme] = useState(localStorage.getItem("theme") || "light");
  const [currentView, setCurrentView] = useState("list");
  const [selectedMapping, setSelectedMapping] = useState(null);

  const orgId = localStorage.getItem("orgId");

  const handleAddNew = () => {
    setSelectedMapping(null);
    setCurrentView("form");
  };

  const handleEdit = (mapping) => {
    setSelectedMapping(mapping);
    setCurrentView("form");
  };

  // Form Back / Cancel → List
  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedMapping(null);
  };

  // Save Success → List
  const handleSaveSuccess = () => {
    handleBackToList();
  };

  // List Back → Previous screen
  const handleBackToPrevious = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div
      className={`performance-goals-gd-container ${
        theme === "dark" ? "dark-mode" : ""
      }`}
    >
      {currentView === "list" && (
        <DocumentMappingList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={handleBackToPrevious}
          orgId={orgId}
        />
      )}

      {currentView === "form" && (
        <DocumentMappingForm
          onBack={handleBackToList}
          onSaveSuccess={handleSaveSuccess}
          editData={selectedMapping}
          orgId={orgId}
        />
      )}
    </div>
  );
};

export default DocumentMapping;
