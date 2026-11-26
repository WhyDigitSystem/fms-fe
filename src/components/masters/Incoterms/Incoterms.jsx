import React, { useState } from "react";
import IncotermsList from "./IncotermsList";
import IncotermsForm from "./IncotermsForm";

const Incoterms = ({ onBack }) => {
    const [currentView, setCurrentView] = useState("list");
    const [selectedIncoterm, setSelectedIncoterm] = useState(null);

    const orgId = parseInt(localStorage.getItem("orgId")) || 1000000001;

    // Add New
    const handleAddNew = () => {
        setSelectedIncoterm(null);
        setCurrentView("form");
    };

    // Edit
    const handleEdit = (incoterm) => {
        setSelectedIncoterm(incoterm);
        setCurrentView("form");
    };

    // Back to List from Form
    const handleBackToList = () => {
        setCurrentView("list");
        setSelectedIncoterm(null);
    };

    return (
        <>
            {currentView === "list" && (
                <IncotermsList
                    onAddNew={handleAddNew}
                    onEdit={handleEdit}
                    orgId={orgId}
                    onBack={onBack || (() => window.history.back())}
                />
            )}

            {currentView === "form" && (
                <IncotermsForm
                    onBack={handleBackToList}
                    onSaveSuccess={handleBackToList}
                    editData={selectedIncoterm}
                    orgId={orgId}
                />
            )}
        </>
    );
};

export default Incoterms;