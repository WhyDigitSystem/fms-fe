import React, { useState } from "react";
import UserList from "./UserList";
import UserForm from "./UserForm";

const User = () => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedUser, setSelectedUser] = useState(null);

  const handleAddNew = () => {
    setSelectedUser(null);
    setCurrentView("form");
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setCurrentView("form");
  };

  const handleBack = () => {
    setCurrentView("list");
    setSelectedUser(null);
  };

  const handleSave = () => {
    setCurrentView("list");
    setSelectedUser(null);
  };

  return (
    <div>
      {currentView === "list" ? (
        <UserList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
        />
      ) : (
        <UserForm
          onBack={handleBack}
          onSave={handleSave}
          editData={selectedUser}
        />
      )}
    </div>
  );
};

export default User;