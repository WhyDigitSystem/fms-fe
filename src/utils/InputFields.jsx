import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";

/* -----------------------------------------------
   FLOATING INPUT COMPONENT
------------------------------------------------ */
export const FloatingInput = ({
  label,
  name,
  value,
  max,
  disabled,
  onChange,
  type = "text",
  required = false,
  className = "",
  error='',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  // const isFloating = isFocused || value !== "";
   const isFloating =
    isFocused || (value !== undefined && value !== null && value !== "");

  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        name={name}
        max={max}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        // className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
           className={`w-full px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none transition-colors ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        }`}
      />
      <label
        className={`absolute left-2 transition-all duration-200 bg-white dark:bg-gray-800 px-1 pointer-events-none ${
          isFloating
            ? "-top-2 text-xs text-blue-600"
            : "top-2 text-sm text-gray-500 dark:text-gray-400"
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
       {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export const FloatingSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  className = "",
  placeholder = "Type to search...",
  noOptionsMessage = "No options found",
  disabled = false,
  error = null, // Add error prop
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  const isFloating = isFocused || value !== "" || isOpen;

  // Get selected option label
  const selectedOption = options.find(opt => {
    // Handle both string and number comparisons
    const optValue = String(opt.value);
    const currentValue = String(value);
    return optValue === currentValue;
  });

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        String(option.label || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(option.value || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    console.log("FloatingSelect handleSelect called:", { 
      name, 
      value: optionValue,
      selectedOption: options.find(opt => String(opt.value) === String(optionValue))
    });
    
    // Check if onChange expects (name, value) or just (value)
    if (typeof onChange === 'function') {
      // Try to detect if onChange expects 2 parameters
      try {
        // Call onChange with both name and value (common pattern)
        onChange(name, optionValue);
      } catch (error) {
        // If that fails, try with just value
        console.log("Trying onChange with just value");
        onChange(optionValue);
      }
    }
    
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm("");
      }
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    console.log("Clearing selection for:", name);
    handleSelect(""); // Pass empty string when clearing
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
    if (e.key === "Enter" && !isOpen) {
      handleToggle();
    }
  };

  return (
    <div 
      className={`relative ${className}`} 
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Display Field */}
      <div
        className={`w-full px-3 py-2 text-sm border rounded min-h-[42px] flex items-center justify-between cursor-pointer transition-colors ${
          disabled 
            ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            : isOpen
              ? "border-blue-500 ring-1 ring-blue-500 bg-white dark:bg-gray-800"
              : error
                ? "border-red-500 ring-1 ring-red-500 bg-white dark:bg-gray-800"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750"
        } ${isFocused ? "border-blue-500" : ""}`}
        onClick={handleToggle}
        onFocus={() => !disabled && setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <div className="flex-1 truncate">
          {selectedOption && (
            <span className="text-gray-900 dark:text-white">
              {selectedOption.label}
            </span>
          )}
          {/* ) : ( */}
            {/* <span className="text-gray-400 dark:text-gray-500">
              Select {label.toLowerCase()}...
            </span> */}
          {/* )} */}
        </div>
        <div className="flex items-center gap-1 ml-2">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Clear selection"
            >
              <X className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            </button>
          )}
          <ChevronDown 
            className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            } ${disabled ? "opacity-50" : ""}`}
          />
        </div>
      </div>

      {/* Floating Label */}
      <label
        className={`absolute left-2 transition-all duration-200 px-1 pointer-events-none ${
          disabled
            ? "bg-gray-100 dark:bg-gray-700"
            : "bg-white dark:bg-gray-800"
        } ${
          isFloating
            ? error
              ? "-top-2 text-xs text-red-600 dark:text-red-400 z-10"
              : "-top-2 text-xs text-blue-600 dark:text-blue-400 z-10"
            : "top-2 text-sm text-gray-500 dark:text-gray-400"
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-8 pr-3 py-2 text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                    String(value) === String(option.value)
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                  onClick={() => handleSelect(option.value)}
                >
                  <span>{option.label}</span>
                  {String(value) === String(option.value) && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                {noOptionsMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const FloatingSimpleSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  className = "",
  error = null, // Add error prop
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || value !== "";

  const handleChange = (e) => {
    const newValue = e.target.value;
    console.log("FloatingSimpleSelect onChange:", { name, value: newValue });
    
    if (typeof onChange === 'function') {
      try {
        // Try with both name and value
        onChange(name, newValue);
      } catch (error) {
        // Fall back to just value
        onChange(newValue);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <select
        name={name}
        value={value || ""}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        className={`w-full px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 transition-colors appearance-none ${
          error 
            ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
            : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
        }`}
      >
        <option value="" className="text-gray-500 dark:text-gray-400">
          Select {label.toLowerCase()}...
        </option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          >
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          className="h-4 w-4 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      <label
        className={`absolute left-2 transition-all duration-200 px-1 pointer-events-none bg-white dark:bg-gray-800 ${
          isFloating
            ? error
              ? "-top-2 text-xs text-red-600 dark:text-red-400"
              : "-top-2 text-xs text-blue-600 dark:text-blue-400"
            : "top-2 text-sm text-gray-500 dark:text-gray-400"
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};