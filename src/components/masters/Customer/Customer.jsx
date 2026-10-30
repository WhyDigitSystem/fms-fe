import React, { useState } from "react";
import CustomerList from "./CustomerList";
import CustomerForm from "./CustomerForm";

const Customer = () => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setCurrentView("form");
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setCurrentView("form");
  };

  const handleBack = () => {
    setCurrentView("list");
    setSelectedCustomer(null);
  };

  // Called by the form after a successful save -> reload list
  const handleSaveSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div>
      {currentView === "list" ? (
        <CustomerList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <CustomerForm
          editData={selectedCustomer}
          onBack={handleBack}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default Customer;
