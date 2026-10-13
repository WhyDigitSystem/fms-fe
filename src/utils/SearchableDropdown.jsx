// Create a new file: SearchableDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { Plus, Search } from "lucide-react";

const SearchableDropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Search...",
  required = false,
  error,
  disabled = false,
  onAddNew,
  addNewText = "Add New",
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter((option) =>
    (option.label || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (selectedValue, selectedLabel) => {
    onChange(selectedValue);
    setSearchTerm("");
    setShowDropdown(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          type="text"
          value={searchTerm || (options.find(opt => opt.value === value)?.label || "")}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 h-9 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          } ${disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {showDropdown && !disabled && (
        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          {/* Scrollable Options List */}
          <div className="max-h-52 overflow-y-auto p-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(option.value, option.label)}
                  className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <p className="font-medium text-gray-700 dark:text-gray-200">
                    {option.label}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 px-3 py-2">
                No results found
              </p>
            )}
          </div>

          {/* Add New Button (if provided) */}
          {onAddNew && (
            <button
              onClick={() => {
                onAddNew();
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 border-t border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-800 rounded-b-xl text-sm"
            >
              <Plus className="h-4 w-4" />
              {addNewText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;