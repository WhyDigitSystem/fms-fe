import { ArrowLeft, Save, X, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { productAPI } from "../../../api/productAPI";
import { useToast } from "../../Toast/ToastContext";

const ORG_ID = Number(localStorage.getItem("orgId"));
const BRANCH_ID = Number(localStorage.getItem("branchId"));

const emptyForm = {
  productCode: "",
  productDescription: "",
};

const controlClasses =
  "w-full h-[36px] px-3 rounded border text-sm leading-none transition-colors bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const controlErrClasses =
  "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const labelClasses = "block text-xs text-gray-600 dark:text-gray-400 mb-1";

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
}) => (
  <div className="min-w-0 w-full">
    <label htmlFor={name} className={labelClasses}>
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>

    <input
      id={name}
      name={name}
      type="text"
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`${controlClasses} ${error ? controlErrClasses : ""}`}
      autoComplete="off"
    />

    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const ProductMasterForm = ({ data, onBack }) => {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { addToast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadById = async () => {
      if (!data?.id) {
        setForm(emptyForm);
        setFieldErrors({});
        return;
      }

      try {
        setIsLoading(true);

        const response = await productAPI.getById(data.id);

        if (!isMounted) return;

        const product =
          response?.paramObjectsMap?.product ||
          response?.paramObjectsMap?.productMaster ||
          response?.data ||
          response;

        if (product) {
          setForm({
            productCode: product.productCode || "",
            productDescription: product.productDescription || "",
          });
        }
      } catch (error) {
        console.error("Failed to load product:", error);

        if (isMounted) {
          addToast("Failed to load product details.", "error");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadById();

    return () => {
      isMounted = false;
    };
  }, [data?.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const errors = {};

    if (!form.productCode.trim()) {
      errors.productCode = "Product Code is required";
    }

    if (!form.productDescription.trim()) {
      errors.productDescription = "Description is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      addToast("Please fill in all required fields.", "error");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...(data?.id && { id: data.id }),
      orgId: ORG_ID,
      branch: BRANCH_ID,
      productCode: form.productCode.trim(),
      productDescription: form.productDescription.trim(),
      createdBy:
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        "admin",
    };

    try {
      const response = await productAPI.save(payload);

      if (response?.status === false) {
        addToast(
          response?.errors?.[0]?.longMessage ||
            response?.paramObjectsMap?.message ||
            "Failed to save product.",
          "error",
        );
        return;
      }

      addToast(
        response?.paramObjectsMap?.message ||
          (data?.id
            ? "Product updated successfully!"
            : "Product saved successfully!"),
        "success",
      );

      onBack?.();
    } catch (error) {
      console.error("Failed to save product:", error);

      addToast(
        error?.response?.data?.errors?.[0]?.longMessage ||
          error?.response?.data?.message ||
          "Failed to save product.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-3 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="p-1 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {data?.id ? "Edit Product" : "Add Product"}
        </h2>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-5"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin text-gray-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Loading product...
            </p>
          </div>
        ) : (
          <>
            {/* Two Larger Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 items-start">
              <Field
                label="Product Code"
                name="productCode"
                value={form.productCode}
                onChange={handleChange}
                error={fieldErrors.productCode}
                required
                disabled={isSubmitting}
              />

              <Field
                label="Description"
                name="productDescription"
                value={form.productDescription}
                onChange={handleChange}
                error={fieldErrors.productDescription}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onBack}
                disabled={isSubmitting}
                className="flex items-center gap-1 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}

                {isSubmitting ? "Saving..." : data?.id ? "Update" : "Save"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default ProductMasterForm;
