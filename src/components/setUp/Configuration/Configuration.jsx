import { useState } from "react";
import ConfigurationList from "./ConfigurationList";
import ConfigurationForm from "./ConfigurationForm";

const initialConfigurations = [
  {
    id: 1,
    configurationName: "Default Configuration",
    companyName: "EFITOPS",
    companyCode: "EFITOPS001",
    financialYear: "2026-2027",
    dateFormat: "DD-MM-YYYY",
    currency: "INR",
    timeZone: "Asia/Kolkata",
    language: "English",
    rowsPerPage: "10",
    theme: "System Default",
    emailNotifications: true,
    autoDocNumber: true,
    status: "Active",
  },
];

const Configuration = ({ onBack }) => {
  const [view, setView] = useState("list");
  const [selectedConfiguration, setSelectedConfiguration] = useState(null);
  const [configurations, setConfigurations] = useState(initialConfigurations);

  const handleAddNew = () => {
    setSelectedConfiguration(null);
    setView("add");
  };

  const handleEdit = (configuration) => {
    setSelectedConfiguration(configuration);
    setView("edit");
  };

  const handleSave = (formData) => {
    if (formData.id) {
      setConfigurations((prev) =>
        prev.map((item) => (item.id === formData.id ? { ...formData } : item)),
      );
    } else {
      const nextId = Math.max(0, ...configurations.map((item) => item.id)) + 1;

      setConfigurations((prev) => [{ ...formData, id: nextId }, ...prev]);
    }

    setSelectedConfiguration(null);
    setView("list");
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-gray-950">
      {view === "list" ? (
        <ConfigurationList
          configurations={configurations}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack}
        />
      ) : (
        <ConfigurationForm
          editData={selectedConfiguration}
          onBack={() => {
            setView("list");
            setSelectedConfiguration(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Configuration;
