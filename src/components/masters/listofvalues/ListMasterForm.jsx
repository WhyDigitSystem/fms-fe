import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useToast } from "../../Toast/ToastContext";
import listformApi from "../../../api/listformApi";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const SELECT_OPTIONS = {
  active: ["Yes", "No"],
};

const SelectField = ({ control, name, label, options, required, errors }) => (
  <div>
    <label className={labelClasses}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      rules={required ? { required: `${label} is required` } : undefined}
      render={({ field }) => (
        <select {...field} className={controlClasses}>
          <option value="">Select</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}
    />
    {!name.includes(".") && errors?.[name] && (
      <p className="text-red-500 text-[11px]">{errors[name].message}</p>
    )}
  </div>
);

const InputField = ({
  control,
  name,
  label,
  type = "text",
  required,
  placeholder,
  errors,
}) => (
  <div>
    <label className={labelClasses}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      rules={required ? { required: `${label} is required` } : undefined}
      render={({ field }) => (
        <input
          {...field}
          type={type}
          className={controlClasses}
          placeholder={placeholder}
        />
      )}
    />
    {!name.includes(".") && errors?.[name] && (
      <p className="text-red-500 text-[11px]">{errors[name].message}</p>
    )}
  </div>
);

const ToggleButton = ({ control, name }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <button
        type="button"
        onClick={() => field.onChange(!field.value)}
        className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${field.value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
          }`}
      >
        <span
          className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${field.value ? "translate-x-6" : "translate-x-0.5"
            }`}
        />
      </button>
    )}
  />
);

const ListMasterForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branch] = useState(localStorage.getItem("branchId"));
  const [userName] = useState(localStorage.getItem("userName"));
  const [loading, setLoading] = useState(false);
  const [activeChildTab, setActiveChildTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch full data when editing
  useEffect(() => {
    const fetchFullData = async () => {
      if (data && data.id) {
        try {
          setLoading(true);
          const fullData = await listformApi.getListById(data.id);
          if (fullData) {
            // Update the form with full data including child IDs
            const detailsArray = fullData.listOfValuesDetailsVO || fullData.details || [];

            const details = detailsArray.length > 0
              ? detailsArray.map((detail) => ({
                id: detail.id || undefined, // Include child ID for editing
                valueCode: detail.valueCode || "",
                valueDescription: detail.valueDescription || "",
                active: detail.active === true || detail.active === "Active" ? "Yes" : "No",
              }))
              : [{ valueCode: "", valueDescription: "", active: "Yes" }];

            reset({
              listCode: fullData.listCode || "",
              listDescription: fullData.listDescription || "",
              active: fullData.active === true || fullData.active === "Active",
              details: details,
            });
            setIsEditing(true);
          }
        } catch (error) {
          console.error("Error fetching full data:", error);
          addToast("Failed to load full data", "error");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFullData();
  }, [data]);

  const getDefaultValues = () => {
    // Check if we're in edit mode
    if (data && data.id) {
      // Get details array from the data
      const detailsArray = data.listOfValuesDetailsVO || data.details || [];

      // If there are existing details, map them, otherwise provide a default empty row
      const details =
        detailsArray.length > 0
          ? detailsArray.map((detail) => ({
            id: detail.id || undefined, // Include child ID for editing
            valueCode: detail.valueCode || "",
            valueDescription: detail.valueDescription || "",
            active:
              detail.active === true || detail.active === "Active"
                ? "Yes"
                : "No",
          }))
          : [{ valueCode: "", valueDescription: "", active: "Yes" }];

      return {
        listCode: data.listCode || "",
        listDescription: data.listDescription || "",
        active: data.active === true || data.active === "Active",
        details: details,
      };
    }

    // Default for new entry
    return {
      listCode: "",
      listDescription: "",
      active: true,
      details: [{ valueCode: "", valueDescription: "", active: "Yes" }],
    };
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(),
  });

  // Field Arrays
  const tabConfig = {
    details: useFieldArray({ control, name: "details" }),
  };

  const getFieldArray = (tab) => tabConfig[tab] || tabConfig.details;
  const handleAdd = (tab) =>
    getFieldArray(tab).append({
      id: undefined, // New rows don't have an ID
      valueCode: "",
      valueDescription: "",
      active: "Yes",
    });
  const handleRemove = (tab, index) => {
    const { fields, remove } = getFieldArray(tab);
    if (fields.length > 1) remove(index);
  };

  const transformFormData = (formData) => {
    const payload = {
      active: formData.active,
      branch: parseInt(branch),
      createdBy: userName,
      details: formData.details.map((detail) => {
        const detailPayload = {
          active: detail.active === 'Yes' ? true : false,
          valueCode: detail.valueCode || "",
          valueDescription: detail.valueDescription || "",
        };

        // Include child ID only if it exists (editing)
        if (detail.id) {
          detailPayload.id = detail.id;
        }

        return detailPayload;
      }),
      listCode: formData.listCode,
      listDescription: formData.listDescription,
      orgId: parseInt(orgId),
    };

    // If editing, include the parent ID
    if (data && data.id) {
      payload.id = data.id;
    }

    return payload;
  };

  const onSubmit = async (formData) => {
    try {
      setLoading(true);

      const apiPayload = transformFormData(formData);

      console.log("API Payload:", apiPayload);

      const res = await listformApi.createUpdateListofValues(apiPayload);

      if (res.status === true) {
        addToast(
          data && data.id
            ? "List of Values updated successfully"
            : "List of Values created successfully",
          "success"
        );

        reset(getDefaultValues());
        onBack();
      } else {
        addToast("Something went wrong", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Error saving List of Values", "error");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-2 max-w-7xl">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={onBack}
            className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Loading...
          </h2>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">
              Loading data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit List" : "Add List"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Basic Details Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          <InputField
            control={control}
            name="listCode"
            label="List Code"
            required
            placeholder="Enter List Code"
            errors={errors}
          />
          <InputField
            control={control}
            name="listDescription"
            label="List Description"
            required
            placeholder="Enter List Description"
            errors={errors}
          />

          <div>
            <label className={labelClasses}>Active</label>
            <ToggleButton control={control} name="active" />
          </div>
        </form>

        {/* Child Tables */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex">
              {["details"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveChildTab(tab)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${activeChildTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300"
                    }`}
                >
                  Details
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleAdd(activeChildTab)}
              className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Tab Content - Details Table */}
          {activeChildTab === "details" && (
            <TableWrapper>
              <TableHead
                headers={[
                  { label: "#", required: false },
                  { label: "Value Code", required: true },
                  { label: "Value Description", required: true },
                  { label: "Active", required: true },
                  { label: "Action", required: false },
                ]}
              />
              <tbody>
                {tabConfig.details.fields.map((field, index) => (
                  <TableRow
                    key={field.id}
                    index={index}
                    onRemove={() => handleRemove("details", index)}
                    disabled={tabConfig.details.fields.length <= 1}
                  >
                    {/* Value Code - Required */}
                    <InputCell
                      control={control}
                      name={`details.${index}.valueCode`}
                      placeholder="Enter Value Code"
                      required
                      errors={errors}
                    />

                    {/* Value Description - Required */}
                    <InputCell
                      control={control}
                      name={`details.${index}.valueDescription`}
                      placeholder="Enter Value Description"
                      required
                      errors={errors}
                    />

                    {/* Active - Required */}
                    <SelectCell
                      control={control}
                      value={field.active}
                      name={`details.${index}.active`}
                      options={SELECT_OPTIONS.active}
                      required
                      errors={errors}
                    />
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}
        </section>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />{" "}
            {loading ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TABLE HELPER COMPONENTS
// ============================================================================
const TableWrapper = ({ children }) => (
  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((h, i) => (
        <th
          key={i}
          className={`p-1 ${i === 0 ? "w-8 text-center" : "text-left"} dark:text-white`}
        >
          {h.label}
          {h.required && <span className="text-red-500 ml-0.5">*</span>}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-1 text-center font-medium dark:text-white align-middle">
      {index + 1}
    </td>
    {children}
    <td className="p-1 text-center align-middle">
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className={`h-5 w-5 rounded text-white flex items-center justify-center ${disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-red-600 hover:bg-red-700"
          }`}
      >
        <Trash2 size={10} />
      </button>
    </td>
  </tr>
);

const SelectCell = ({ control, name, options, required, errors }) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <td className="p-1 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <select
            {...field}
            className={`${controlClasses} h-8 text-xs w-full ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
          >
            <option value="">Select</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
      />
      {errorMessage && (
        <div className="text-red-500 text-[10px] mt-0.5 text-left w-full">
          {errorMessage}
        </div>
      )}
    </td>
  );
};

const InputCell = ({
  control,
  name,
  type = "text",
  step,
  placeholder,
  required,
  errors,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <td className="p-1 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`${controlClasses} h-8 text-xs w-full ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder={placeholder}
          />
        )}
      />
      {errorMessage && (
        <div className="text-red-500 text-[10px] mt-0.5 text-left w-full">
          {errorMessage}
        </div>
      )}
    </td>
  );
};

export default ListMasterForm;