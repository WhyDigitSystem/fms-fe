import { useState } from "react";
import ListMasterList from "./ListMasterList";
import ListMasterForm from "./ListMasterForm";

const ListMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const addNew = () => {
    console.log("Add button clicked");
    setEditData(null);
    setScreen("form");
  };

  const edit = (row) => {
    setEditData(row);
    setScreen("form");
  };

  return (
    <>
      {screen === "list" && (
        <ListMasterList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <ListMasterForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default ListMaster;