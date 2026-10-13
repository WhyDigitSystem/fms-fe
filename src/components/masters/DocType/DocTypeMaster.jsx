import React, { useState } from "react";
import DocTypeForm from "./DocTypeForm";
import DocTypeList from "./DocTypeList";


const DocType = () => {
  const [theme] = useState(localStorage.getItem("theme") || "light");
  const [currentView, setCurrentView] = useState("list"); // "list", "form"
  const [selectedDocType, setSelectedDocType] = useState(null);
  const orgId = localStorage.getItem("orgId");

  const handleAddNew = () => {
    setSelectedDocType(null);
    setCurrentView("form");
  };

  const handleEdit = (docType) => {
    setSelectedDocType(docType);
    setCurrentView("form");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedDocType(null);
  };

  const handleSaveSuccess = () => {
    handleBackToList();
  };

  return (
    <div className={`performance-goals-gd-container ${theme === "dark" ? "dark-mode" : ""}`}>
      {currentView === "list" && (
        <DocTypeList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
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