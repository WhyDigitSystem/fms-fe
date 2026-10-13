import { useState } from "react";
import ScreenNamesList from "./ScreenNamesList";
import ScreenNamesForm from "./ScreenNamesForm";
import screensAPI from "../../../api/screensAPI"; // Changed from masterAPI to screensAPI

const ScreenNames = () => {
    const [currentView, setCurrentView] = useState("list"); // "list", "add", "edit"
    const [selectedScreen, setSelectedScreen] = useState(null);

    const handleAddNew = () => {
        setSelectedScreen(null);
        setCurrentView("add");
    };

    const handleEdit = (screen) => {
        setSelectedScreen(screen);
        setCurrentView("edit");
    };

    const handleBackToList = () => {
        setCurrentView("list");
        setSelectedScreen(null);
    };

    const handleSave = async (payload) => {
        try {
            if (payload.id) {
                // Update existing screen
                await screensAPI.updateScreen(payload.id, payload);
            } else {
                // Create new screen
                await screensAPI.createScreen(payload);
            }
            handleBackToList();
        } catch (error) {
            console.error("Error saving screen:", error);
            throw error;
        }
    };

    return (
        <>
            {currentView === "list" && (
                <ScreenNamesList
                    onAddNew={handleAddNew}
                    onEdit={handleEdit}
                    onBack={() => window.history.back()}
                />
            )}

            {(currentView === "add" || currentView === "edit") && (
                <ScreenNamesForm
                    onBack={handleBackToList}
                    onSave={handleSave}
                    editData={selectedScreen}
                />
            )}
        </>
    );
};

export default ScreenNames;