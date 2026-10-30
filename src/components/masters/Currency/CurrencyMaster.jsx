import { useState } from "react";
import CurrencyList from "./CurrencyList";
import CurrencyForm from "./CurrencyForm";

const CurrencyMaster = ({ onBack }) => {
  const [screen, setScreen] = useState("list"); // list | form
  const [editData, setEditData] = useState(null);

  // Add New Currency
  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  // Edit Currency
  const handleEdit = (data) => {
    setEditData(data);
    setScreen("form");
  };

  // Back to List
  const handleBack = () => {
    setScreen("list");
    setEditData(null);
  };

  // Back to Parent
  const handleParentBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <>
      {screen === "list" && (
        <CurrencyList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={handleParentBack}
        />
      )}

      {screen === "form" && (
        <CurrencyForm
          editData={editData}
          onBack={handleBack}
          onSaveSuccess={handleBack}
        />
      )}
    </>
  );
};

export default CurrencyMaster;
