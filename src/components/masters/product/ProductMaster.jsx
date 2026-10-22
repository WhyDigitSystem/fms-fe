import { useState } from "react";
import ProductMasterList from "./ProductMasterList";
import ProductMasterForm from "./ProductMasterForm";

const ProductMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const addNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const edit = (row) => {
    setEditData(row);
    setScreen("form");
  };

  const backToList = () => {
    setScreen("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      {screen === "list" && (
        <ProductMasterList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <ProductMasterForm data={editData} onBack={backToList} />
      )}
    </>
  );
};

export default ProductMaster;
