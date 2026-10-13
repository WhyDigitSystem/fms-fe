import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingInput, FloatingSelect } from "../../../utils/InputFields";
import { useToast } from "../../Toast/ToastContext";
import { getAllActiveCountries, getAllActiveStatesByCountry, getAllActiveCitiesByState } from '../../../utils/CommonFunctions';
import apiClient from "../../../api/apiClient";

const BranchMasterForm = ({ onBack, onSaveSuccess, editData }) => {
    const ORG_ID = localStorage.getItem('orgId');
    const loginUserName = localStorage.getItem('userName');
    const loginUserId = localStorage.getItem('userId');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});

    const [form, setForm] = useState({
        id: editData?.id || 0,
        companyName: editData?.companyName || '',
        branchCode: editData?.branchCode || '',
        branchName: editData?.branch || '',
        mobile: editData?.phone || '',
        address: editData?.addressLine1 || '',
        country: editData?.country || '',
        state: editData?.state || '',
        city: editData?.city || '',
        pincode: editData?.pinCode || '',
        gst: editData?.gstIn || '',
        active: editData?.active === 'Active' ? true : (editData?.active ?? true),
    });

    // Field labels for toast messages
    const fieldLabels = {
        branchCode: "Branch Code",
        branchName: "Branch Name",
        address: "Address",
        country: "Country",
        state: "State",
        city: "City",
        gst: "GST",
        mobile: "Mobile",
        pincode: "Pincode",
    };

    // Get company details on mount
    useEffect(() => {
        getCompanyDetails();
        getAllCountries();
    }, []);

    // Fetch states when country changes
    useEffect(() => {
        if (form.country) {
            getAllStates();
        }
    }, [form.country]);

    // Fetch cities when state changes
    useEffect(() => {
        if (form.state) {
            getAllCities();
        }
    }, [form.state]);

    const getCompanyDetails = async () => {
        try {
            const response = await apiClient.get(`/api/commonmaster/company/${ORG_ID}`);
            if (response.status === true) {
                const company = response.paramObjectsMap.companyVO[0];
                setForm(prev => ({ ...prev, companyName: company.companyName }));
            }
        } catch (error) {
            console.error('Error fetching company details:', error);
        }
    };

    const getAllCountries = async () => {
        try {
            const countryData = await getAllActiveCountries(ORG_ID);
            setCountries(countryData);
        } catch (error) {
            console.error('Error fetching countries:', error);
        }
    };

    const getAllStates = async () => {
        try {
            const stateData = await getAllActiveStatesByCountry(form.country, ORG_ID);
            setStates(stateData);
        } catch (error) {
            console.error('Error fetching states:', error);
        }
    };

    const getAllCities = async () => {
        try {
            const cityData = await getAllActiveCitiesByState(form.state, ORG_ID);
            setCities(cityData);
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }

        const branchCodeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
        const branchNameRegex = /^[A-Za-z0-9@_\-* ]*$/;
        const alphanumericRegex = /^[A-Za-z0-9]*$/;
        const numericRegex = /^[0-9]*$/;

        let errorMessage = "";
        let updatedValue = value;

        if (name === "active") {
            setForm(prev => ({ ...prev, active: checked }));
            return;
        }

        switch (name) {
            case "branchCode":
                if (!branchCodeRegex.test(value)) {
                    errorMessage = "Only alphanumeric characters and @, _, -, /, \\ are allowed";
                }
                updatedValue = value.toUpperCase();
                break;
            case "branchName":
                if (!branchNameRegex.test(value)) {
                    errorMessage = "Only alphanumeric characters and @, _, -, * are allowed";
                }
                updatedValue = value.toUpperCase();
                break;
            case "gst":
                if (!alphanumericRegex.test(value)) {
                    errorMessage = "Special characters are not allowed";
                } else if (value.length > 15) {
                    errorMessage = "Only 15 characters are allowed";
                }
                updatedValue = value.toUpperCase();
                break;
            case "pincode":
                if (!numericRegex.test(value)) {
                    errorMessage = "Only numeric characters are allowed";
                } else if (value.length > 6) {
                    errorMessage = "Only 6 digits are allowed";
                    updatedValue = value.slice(0, 6);
                }
                break;
            case "mobile":
                if (!numericRegex.test(value)) {
                    errorMessage = "Only numeric characters are allowed";
                } else if (value.length > 10) {
                    errorMessage = "Only 10 digits are allowed";
                    updatedValue = value.slice(0, 10);
                }
                break;
            default:
                updatedValue = value;
                break;
        }

        if (errorMessage) {
            setFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
        } else {
            setForm(prev => ({ ...prev, [name]: updatedValue }));
        }
    };

    const handleSelectChange = (name, value) => {
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }

        setForm(prev => ({
            ...prev,
            [name]: value,
            ...(name === "country" ? { state: '', city: '' } : {}),
            ...(name === "state" ? { city: '' } : {})
        }));
    };

    const handleSave = async () => {
        // Validate form
        const errors = {};

        if (!form.branchCode.trim()) errors.branchCode = "Branch Code is required";
        if (!form.branchName.trim()) errors.branchName = "Branch Name is required";
        if (!form.address.trim()) errors.address = "Address is required";
        if (!form.country) errors.country = "Country is required";
        if (!form.state) errors.state = "State is required";
        if (!form.city) errors.city = "City is required";
        if (!form.gst.trim()) errors.gst = "GST is required";
        if (form.gst && form.gst.length < 15) errors.gst = "Invalid GST No";
        if (form.mobile && form.mobile.length > 0 && form.mobile.length < 10) errors.mobile = "Invalid Mobile No";
        if (form.pincode && form.pincode.length > 0 && form.pincode.length < 6) errors.pincode = "Invalid Pincode";

        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            const firstErrorField = Object.keys(errors)[0];
            const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
            const errorMessage = errors[firstErrorField];
            addToast('error', `${fieldLabel}: ${errorMessage}`);
            return;
        }

        setIsSubmitting(true);

        const payload = {
            ...(form.id && form.id !== 0 ? { id: form.id } : {}),
            branchCode: form.branchCode,
            branch: form.branchName,
            phone: form.mobile,
            pinCode: form.pincode,
            addressLine1: form.address,
            addressLine2: '',
            country: form.country,
            state: form.state,
            city: form.city,
            region: '',
            active: form.active,
            orgId: ORG_ID,
            createdBy: loginUserName,
            gstIn: form.gst,
            lccurrency: '',
            pan: '',
            stateCode: '',
            stateNo: '',
            userid: loginUserId
        };

        console.log("📤 Saving Branch Payload:", payload);

        try {
            const response = await apiClient.put(`/api/warehousemastercontroller/createUpdateBranch`, payload);
            console.log("📥 Save Response:", response);

            if (response.status === true) {
                const successMessage = form.id && form.id !== 0 ? "Branch updated successfully!" : "Branch created successfully!";
                addToast('success', successMessage);

                if (onSaveSuccess) onSaveSuccess(form.id && form.id !== 0 ? 'updated' : 'created');
                onBack();
            } else {
                const errorMessage = response.paramObjectsMap?.errorMessage || "Failed to save branch";
                addToast('error', errorMessage);
            }
        } catch (error) {
            console.error("❌ Save Error:", error);
            addToast('error', "Save failed! Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Options for selects
    const countryOptions = countries.map(country => ({
        value: country.countryName,
        label: country.countryName
    }));

    const stateOptions = states.map(state => ({
        value: state.stateName,
        label: state.stateName
    }));

    const cityOptions = cities.map(city => ({
        value: city.cityName,
        label: city.cityName
    }));

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* HEADER - Similar to CarrierMasterForm */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {editData ? "Edit Branch" : "Create Branch"}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Create and manage branch master entries
                        </p>
                    </div>
                </div>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                    List View
                </button>
            </div>

            {/* ACTION BUTTONS - Similar to CarrierMasterForm */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="h-3 w-3" />
                    {isSubmitting ? "Saving..." : (editData ? "Update" : "Save")}
                </button>

                <button
                    onClick={() => {
                        setForm({
                            id: 0,
                            companyName: form.companyName,
                            branchCode: '',
                            branchName: '',
                            mobile: '',
                            address: '',
                            country: '',
                            state: '',
                            city: '',
                            pincode: '',
                            gst: '',
                            active: true,
                        });
                        setFieldErrors({});
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors"
                >
                    <X className="h-3 w-3" />
                    Clear
                </button>
            </div>

            {/* MAIN FORM CONTENT */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                {/* BASIC INFO TAB */}
                <div className="space-y-4">
                    {/* MAIN FORM GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FloatingInput
                            label="Company Name"
                            name="companyName"
                            value={form.companyName}
                            disabled
                            readOnly
                        />

                        <FloatingInput
                            label="Branch Code *"
                            name="branchCode"
                            value={form.branchCode}
                            onChange={handleChange}
                            error={fieldErrors.branchCode}
                            required
                        />

                        <FloatingInput
                            label="Branch Name *"
                            name="branchName"
                            value={form.branchName}
                            onChange={handleChange}
                            error={fieldErrors.branchName}
                            required
                        />

                        <FloatingInput
                            label="Mobile"
                            name="mobile"
                            value={form.mobile}
                            onChange={handleChange}
                            error={fieldErrors.mobile}
                            maxLength={10}
                        />

                        <FloatingInput
                            label="Address *"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            error={fieldErrors.address}
                            required
                        />

                        <FloatingSelect
                            label="Country *"
                            name="country"
                            value={form.country}
                            onChange={handleSelectChange}
                            options={countryOptions}
                            error={fieldErrors.country}
                            required
                        />

                        <FloatingSelect
                            label="State *"
                            name="state"
                            value={form.state}
                            onChange={handleSelectChange}
                            options={stateOptions}
                            error={fieldErrors.state}
                            required
                            disabled={!form.country}
                        />

                        <FloatingSelect
                            label="City *"
                            name="city"
                            value={form.city}
                            onChange={handleSelectChange}
                            options={cityOptions}
                            error={fieldErrors.city}
                            required
                            disabled={!form.state}
                        />

                        <FloatingInput
                            label="Pincode"
                            name="pincode"
                            value={form.pincode}
                            onChange={handleChange}
                            error={fieldErrors.pincode}
                            maxLength={6}
                        />

                        <FloatingInput
                            label="GST *"
                            name="gst"
                            value={form.gst}
                            onChange={handleChange}
                            error={fieldErrors.gst}
                            required
                            maxLength={15}
                        />

                        {/* Active Checkbox */}
                        <div className="flex items-center gap-2 p-1">
                            <input
                                type="checkbox"
                                name="active"
                                checked={form.active}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BranchMasterForm;