import { ArrowLeft, Save, X, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { modeMasterAPI } from "../../../api/modeMasterAPI";
import { useToast } from "../../Toast/ToastContext";

const ORG_ID = Number(localStorage.getItem("orgId")) || 0;

const EMPTY_FORM = {
  modeCode: "",
  modeName: "",
  description: "",
  active: true,
  cancelRemarks: "",
};

const inputClass =
  "w-full h-[30px] px-2 rounded border text-xs " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 focus:outline-none " +
  "focus:ring-1 focus:ring-blue-500 disabled:opacity-60";

const labelClass = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const ModeMasterForm = ({ data, onBack }) => {
  const { addToast } = useToast();

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    setErrors({});

    if (!data?.id) {
      setForm({ ...EMPTY_FORM });
      setLoading(false);

      return () => {
        mounted = false;
      };
    }

    const loadMode = async () => {
      setLoading(true);

      try {
        const mode = await modeMasterAPI.getById(data.id);

        if (!mounted) return;

        if (!mode || mode.status === false) {
          addToast("Failed to load mode details", "error");
          return;
        }

        setForm({
          modeCode: mode.modeCode || "",
          modeName: mode.modeName || "",
          description: mode.description || "",
          active:
            mode.active === true ||
            mode.active === "Active" ||
            mode.active === "Y" ||
            mode.active === 1,
          cancelRemarks: mode.cancelRemarks || "",
        });
      } catch (error) {
        console.error("Error loading mode:", error);
        if (mounted) {
          addToast("Failed to load mode details", "error");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadMode();

    return () => {
      mounted = false;
    };
  }, [data?.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "modeCode" || name === "modeName"
          ? value.toUpperCase()
          : value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.modeCode.trim()) {
      nextErrors.modeCode = "Mode Code is required";
    }

    if (!form.modeName.trim()) {
      nextErrors.modeName = "Mode Name is required";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      addToast("Please fill all required fields", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      ...(data?.id ? { id: data.id } : {}),
      active: Boolean(form.active),
      cancelRemarks: form.cancelRemarks.trim(),
      createdBy:
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        "admin",
      description: form.description.trim(),
      modeCode: form.modeCode.trim(),
      modeName: form.modeName.trim(),
      orgId: ORG_ID,
    };

    try {
      setSubmitting(true);

      const response = await modeMasterAPI.save(payload);

      if (response?.status === false) {
        addToast(
          response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save mode",
          "error",
        );
        return;
      }

      addToast(
        response?.paramObjectsMap?.message ||
          response?.message ||
          (data?.id
            ? "Mode updated successfully"
            : "Mode created successfully"),
        "success",
      );

      onBack?.();
    } catch (error) {
      console.error("Error saving mode:", error?.response?.data || error);

      addToast(
        error?.response?.data?.message ||
          error?.response?.data?.paramObjectsMap?.message ||
          "Failed to save mode",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    {
      name: "modeCode",
      label: "Mode Code",
      required: true,
    },
    {
      name: "modeName",
      label: "Mode Name",
      required: true,
    },
    {
      name: "description",
      label: "Description",
    },
    // {
    //   name: "cancelRemarks",
    //   label: "Cancel Remarks",
    // },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {data?.id ? "Update Mode Master" : "Create Mode Master"}
        </h2>
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-xs text-gray-500">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading mode details...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 items-start gap-x-3 gap-y-2 md:grid-cols-4">
              {fields.map((field) => (
                <div key={field.name} className="w-full min-w-0">
                  <label className={labelClass} htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>

                  <input
                    id={field.name}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    className={`${inputClass} ${
                      errors[field.name] ? "border-red-500" : ""
                    }`}
                    maxLength={field.name === "modeCode" ? 30 : 150}
                  />

                  {errors[field.name] && (
                    <p className="mt-0.5 text-[11px] text-red-500">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}

              <div className="w-full min-w-0">
                <label className={`${labelClass} opacity-0`}>Active</label>

                <label
                  htmlFor="modeActive"
                  className={`${inputClass} flex cursor-pointer items-center gap-2`}
                >
                  <input
                    id="modeActive"
                    type="checkbox"
                    checked={Boolean(form.active)}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        active: event.target.checked,
                      }))
                    }
                    className="h-3.5 w-3.5 accent-blue-600"
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
              <button
                type="button"
                onClick={onBack}
                disabled={submitting}
                className="flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                {submitting ? "Saving..." : data?.id ? "Update" : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModeMasterForm;
