export default function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  compact = true,
  type = "text",
}) {
  return (
    <div className="flex flex-col space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 ${compact ? "py-1.5 text-sm" : "py-2.5"} border border-gray-300 dark:border-gray-600 rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 
        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors disabled:opacity-70`}
      />
    </div>
  );
}
