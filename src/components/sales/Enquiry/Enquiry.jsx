import { useCallback, useEffect, useState } from "react";
import EnquiryList from "./EnquiryList";
import EnquiryForm from "./EnquiryForm";
import EnquiryAPI from "../../../api/sales/enquiryAPI";

const Enquiry = ({ onBack }) => {
  const [view, setView] = useState("list");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orgId = parseInt(localStorage.getItem("orgId")) || 1000000001;
  // The list endpoint needs a branch id; fall back to orgId if not set.
  const branchId = parseInt(localStorage.getItem("branchId")) || orgId;

  // --------------------------------------------------------------
  // Load enquiries from API
  // --------------------------------------------------------------
  const loadEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await EnquiryAPI.getEnquiryByOrgId(branchId, orgId);
      setEnquiries(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error("Failed to load enquiries:", err);
      setError("Failed to load enquiries. Please try again.");
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }, [branchId, orgId]);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  // --------------------------------------------------------------
  // Navigation
  // --------------------------------------------------------------
  const handleAddNew = () => {
    setSelectedEnquiry(null);
    setView("add");
  };

  const handleEdit = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setView("edit");
  };

  const handleBackToList = () => {
    setSelectedEnquiry(null);
    setView("list");
  };

  // --------------------------------------------------------------
  // Save — the form already performs the API save; just refresh
  // --------------------------------------------------------------
  const handleSave = async () => {
    await loadEnquiries();
    setSelectedEnquiry(null);
    setView("list");
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-gray-950">
      {view === "list" ? (
        <EnquiryList
          enquiries={enquiries}
          loading={loading}
          error={error}
          onRetry={loadEnquiries}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack}
        />
      ) : (
        <EnquiryForm
          editData={selectedEnquiry}
          onBack={handleBackToList}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Enquiry;