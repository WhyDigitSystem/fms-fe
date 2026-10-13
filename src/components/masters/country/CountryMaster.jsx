import { useState } from "react";
import CountryMasterList from "./CountryMasterList";
import CountryMasterForm from "./CountryMasterForm";

const CountryMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const addNew = () => {
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
        <CountryMasterList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <CountryMasterForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default CountryMaster;
