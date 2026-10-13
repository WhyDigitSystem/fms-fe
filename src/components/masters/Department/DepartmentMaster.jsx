// CustomerMasterPage.jsx
import { useState } from "react";
import DepartmentListView from "./DepartmentListView";
import DepartmentMasterForm from "./DepartmentMasterForm";

const DepartmentMasterPage = () => {
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
  };

  return (
    <>
      {screen === "list" && (
        <DepartmentListView
          onAddNew={handleAddNew}
          onEdit={handleEdit}
        />
      )}

      {screen === "form" && (
        <DepartmentMasterForm
          editData={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default DepartmentMasterPage;