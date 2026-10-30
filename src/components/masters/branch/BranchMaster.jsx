import { useState } from "react";
import BranchMasterList from "./BranchList";
import BranchMasterForm from "./BranchMasterForm";

const BranchMaster = () => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Add New
  const handleAddNew = () => {
    setSelectedBranch(null);
    setCurrentView("form");
  };

  // Edit
  const handleEdit = (branch) => {
    setSelectedBranch(branch);
    setCurrentView("form");
  };

  // Back to List
  const handleBack = () => {
    setCurrentView("list");
    setSelectedBranch(null);
  };

  // Save Success
  const handleSaveSuccess = (action) => {
    setRefreshTrigger((prev) => prev + 1);
    handleBack();

    console.log(`Branch ${action} successfully`);
  };

  return (
    <div>
      {currentView === "list" ? (
        <BranchMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={handleBack}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <BranchMasterForm
          editData={selectedBranch}
          onBack={handleBack}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default BranchMaster;
