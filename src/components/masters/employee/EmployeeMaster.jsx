// EmployeeMasterPage.jsx
import { useState } from "react";
import EmployeeMasterList from "./EmployeeMasterList";
import EmployeeMasterForm from "./EmployeeMasterForm";

const EmployeeMasterPage = ({ onBack }) => {
  const [screen, setScreen] = useState("list"); // list | form
  const [editData, setEditData] = useState(null);

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (data) => {
    setEditData(data);
    setScreen("form");
  };

  // Return from form to employee list
  const handleBackToList = () => {
    setScreen("list");
    setEditData(null);
  };

  // Return from list to previous page
  const handleBackFromList = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleSaveSuccess = (action) => {
    console.log(`Employee ${action} successfully`);
    handleBackToList();
  };

  return (
    <>
      {screen === "list" && (
        <EmployeeMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={handleBackFromList}
        />
      )}

      {screen === "form" && (
        <EmployeeMasterForm
          editData={editData}
          onBack={handleBackToList}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </>
  );
};

export default EmployeeMasterPage;
