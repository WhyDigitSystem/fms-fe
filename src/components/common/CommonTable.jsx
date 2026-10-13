import React, { useMemo } from "react";

/**
 * CommonTable
 * - Fully controlled: parent owns `rows` and updates via `onRowsChange`
 * - Columns schema: [{ key, header, type, options, placeholder, width, grow }]
 *      type: "text" | "number" | "date" | "select" | "checkbox" | "textarea"
 * - Built-in "Add Row" button (optional) and Delete per-row
 */
const inputBase =
  "w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm " +
  "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none " +
  "focus:ring-2 focus:ring-blue-500 focus:border-transparent";

export default function CommonTable({
  title,
  columns = [],
  rows = [],
  onRowsChange = () => {},
  addLabel = "Add Row",
  showAdd = true,
  showDelete = true,
  className = "",
}) {
  const headerCols = useMemo(
    () => ["No.", ...columns.map((c) => c.header), ...(showDelete ? [""] : [])],
    [columns, showDelete]
  );

  const handleCellChange = (rowIndex, key, value, type) => {
    const next = rows.map((r, i) =>
      i === rowIndex
        ? {
            ...r,
            [key]: type === "number" ? (value === "" ? "" : +value) : type === "checkbox" ? !!value : value,
          }
        : r
    );
    onRowsChange(next);
  };

  const handleAddRow = () => {
    const empty = columns.reduce((acc, c) => {
      if (c.type === "checkbox") acc[c.key] = false;
      else acc[c.key] = "";
      return acc;
    }, {});
    onRowsChange([...rows, { id: crypto.randomUUID(), ...empty, _editing: true }]);
  };

  const handleDelete = (rowIndex) => {
    const next = rows.filter((_, i) => i !== rowIndex);
    onRowsChange(next);
  };

  const renderCell = (row, rowIndex, col) => {
    const val = row[col.key];

    switch (col.type) {
      case "select":
        return (
          <select
            className={inputBase}
            value={val}
            onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value, "text")}
          >
            {(col.options || []).map((opt) => (
              <option key={opt.value ?? opt} value={opt.value ?? opt}>
                {opt.label ?? opt}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={!!val}
              onChange={(e) => handleCellChange(rowIndex, col.key, e.target.checked, "checkbox")}
              className="h-4 w-4 accent-blue-600"
            />
          </div>
        );
      case "date":
        return (
          <input
            type="date"
            className={inputBase}
            value={val}
            onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value, "text")}
          />
        );
      case "number":
        return (
          <input
            type="number"
            className={inputBase}
            value={val}
            placeholder={col.placeholder}
            onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value, "number")}
          />
        );
      case "textarea":
        return (
          <textarea
            className={inputBase}
            rows={2}
            value={val}
            placeholder={col.placeholder}
            onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value, "text")}
          />
        );
      default:
        return (
          <input
            type="text"
            className={inputBase}
            value={val}
            placeholder={col.placeholder}
            onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value, "text")}
          />
        );
    }
  };

  return (
    <div className={`w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
          {showAdd && (
            <button
              onClick={handleAddRow}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              {addLabel}
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-700/60 text-gray-900 dark:text-gray-100">
            <tr>
              {headerCols.map((h, i) => (
                <th key={i} className="px-3 py-2 font-semibold border-b border-gray-200 dark:border-gray-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headerCols.length} className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No Data
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => (
                <tr
                  key={row.id ?? rIdx}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50`}
                >
                  <td className="px-3 py-2">{rIdx + 1}</td>
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2 align-top">
                      <div style={{ width: col.width }} className={col.grow ? "w-full" : ""}>
                        {renderCell(row, rIdx, col)}
                      </div>
                    </td>
                  ))}
                  {showDelete && (
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleDelete(rIdx)}
                        className="px-2 py-1 text-xs rounded-md bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Add button (when no title prop provided) */}
      {!title && showAdd && (
        <div className="px-3 py-2">
          <button
            onClick={handleAddRow}
            className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            {addLabel}
          </button>
        </div>
      )}
    </div>
  );
}
