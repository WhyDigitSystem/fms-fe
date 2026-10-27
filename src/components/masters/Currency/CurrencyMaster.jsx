import { useState } from "react";
import CurrencyList from "./CurrencyList";
import CurrencyForm from "./CurrencyForm";

const CurrencyMaster = () => {
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
                <CurrencyList
                    onAddNew={handleAddNew}
                    onEdit={handleEdit}
                    onBack={() => { }} // Optional: hook up parent back button if needed
                />
            )}

            {screen === "form" && (
                <CurrencyForm
                    editData={editData}
                    onBack={handleBack}
                    onSaveSuccess={handleBack} // Triggers automatic reload on back
                />
            )}
        </>
    );
};

export default CurrencyMaster;