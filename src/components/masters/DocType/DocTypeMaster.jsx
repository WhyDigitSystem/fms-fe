import React, { useState } from "react";
import DocTypeForm from "./DocTypeForm";
import DocTypeList from "./DocTypeList";

const DocType = ({ onBack }) => {
  const [theme] = useState(localStorage.getItem("theme") || "light");
  const [currentView, setCurrentView] = useState("list");
  const [selectedDocType, setSelectedDocType] = useState(null);

  const orgId = localStorage.getItem("orgId");

  // Add New
  const handleAddNew = () => {
    setSelectedDocType(null);
    setCurrentView("form");
  };

  // Edit
  const handleEdit = (docType) => {
    setSelectedDocType(docType);
    setCurrentView("form");
  };

  // Back from Form to List
  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedDocType(null);
  };

  // Save Success
  const handleSaveSuccess = () => {
    handleBackToList();
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
    <div
      className={`performance-goals-gd-container ${
        theme === "dark" ? "dark-mode" : ""
      }`}
    >
      {currentView === "list" && (
        <DocTypeList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={handleBackToPrevious}
          orgId={orgId}
        />
      )}

      {currentView === "form" && (
        <DocTypeForm
          onBack={handleBackToList}
          onSaveSuccess={handleSaveSuccess}
          editData={selectedDocType}
          orgId={orgId}
        />
      )}
    </div>
  );
};

export default DocType;
