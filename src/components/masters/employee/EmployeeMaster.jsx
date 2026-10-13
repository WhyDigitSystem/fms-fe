import { useState } from "react";
import EmployeeMasterList from "./EmployeeMasterList";
import EmployeeMasterForm from "./EmployeeMasterForm";

const EmployeeMasterPage = () => {
  const [screen, setScreen] = useState("list");   // list | form
  const [editData, setEditData] = useState(null); // when editing

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (data) => {
    setEditData(data);
    setScreen("form");
  };

  const handleBack = () => {
    setScreen("list");
    setEditData(null);
  };

  const handleSaveSuccess = (action) => {
    console.log(`Employee ${action} successfully`);
    setScreen("list");
    setEditData(null);
  };

  return (
    <>
      {screen === "list" && (
        <EmployeeMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={handleBack}
        />
      )}

      {screen === "form" && (
        <EmployeeMasterForm
          editData={editData}
          onBack={handleBack}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </>
  );
};

export default EmployeeMasterPage;