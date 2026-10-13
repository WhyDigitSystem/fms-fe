const InputField = ({ label, name, value, onChange, ...props }) => (
  <div className="flex flex-col space-y-1">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <input
      type="text"
      name={name}
      value={value || ""}
      onChange={onChange}
      {...props}
      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors"
    />
  </div>
);
