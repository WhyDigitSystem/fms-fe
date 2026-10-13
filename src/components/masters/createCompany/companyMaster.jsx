// CreateCompanyPage.jsx (Main container)
import { useState } from "react";
import CreateCompanyListview from "./createCompanyListview";
import CreateCompanyForm from "./createCompanyMaster";

const CreateCompanyPage = () => {
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
                <CreateCompanyListview
                    onAddNew={handleAddNew}
                    onEdit={handleEdit}
                />
            )}

            {screen === "form" && (
                <CreateCompanyForm
                    editData={editData}
                    onBack={handleBack}
                />
            )}
        </>
    );
};

export default CreateCompanyPage;