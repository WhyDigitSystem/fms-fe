// DepartmentMasterPage.jsx
import { useState } from "react";
import DepartmentListView from "./DepartmentListView";
import DepartmentMasterForm from "./DepartmentMasterForm";

const DepartmentMasterPage = ({ onBack }) => {
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

  const handleBackToList = () => {
    setScreen("list");
    setEditData(null);
  };

  return (
    <>
      {screen === "list" && (
        <DepartmentListView
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack || (() => window.history.back())}
        />
      )}

      {screen === "form" && (
        <DepartmentMasterForm editData={editData} onBack={handleBackToList} />
      )}
    </>
  );
};

export default DepartmentMasterPage;
