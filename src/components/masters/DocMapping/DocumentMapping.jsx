import React, { useState } from "react";
import DocumentMappingForm from "./DocumentMappingForm";
import DocumentMappingList from "./DocumentMappingList";


const DocumentMapping = () => {
  const [theme] = useState(localStorage.getItem("theme") || "light");
  const [currentView, setCurrentView] = useState("list"); // "list", "form"
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

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedMapping(null);
  };

  const handleSaveSuccess = () => {
    handleBackToList();
  };

  return (
    <div className={`performance-goals-gd-container ${theme === "dark" ? "dark-mode" : ""}`}>
      {currentView === "list" && (
        <DocumentMappingList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
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