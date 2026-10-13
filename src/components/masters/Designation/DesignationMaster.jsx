import { useState } from "react";
import DesignationListView from "./DesignationListView";  // ✅ Correct import
import DesignationMasterForm from "./DesignationForm";

const DesignationMasterPage = () => {
    const [screen, setScreen] = useState("list");
    const [editData, setEditData] = useState(null);

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
                <DesignationListView
                    onAddNew={handleAddNew}
                    onEdit={handleEdit}
                />
            )}

            {screen === "form" && (
                <DesignationMasterForm
                    editData={editData}
                    onBack={handleBack}
                />
            )}
        </>
    );
};

export default DesignationMasterPage;