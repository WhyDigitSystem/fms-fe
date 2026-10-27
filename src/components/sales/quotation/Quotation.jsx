import { useCallback, useEffect, useState } from "react";
import QuotationList from "./QuotationList";
import QuotationForm from "./QuotationForm";
import QuotationAPI from "../../../api/sales/quotationAPI";

const Quotation = ({ onBack }) => {
  const [view, setView] = useState("list");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  const orgId = parseInt(localStorage.getItem("orgId"));
  const branchId = parseInt(localStorage.getItem("branchId"));

  const loadQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await QuotationAPI.getQuotationByOrgIdAndBranch(branchId, orgId);
      setQuotations(data);
    } catch (error) {
      console.error("Failed to load quotations", error);
    } finally {
      setLoading(false);
    }
  }, [branchId, orgId]);

  useEffect(() => {
    loadQuotations();
  }, [loadQuotations]);

  const handleAddNew = () => {
    setSelectedQuotation(null);
    setView("add");
  };

  const handleEdit = (quotation) => {
    setSelectedQuotation(quotation);
    setView("edit");
  };

  const handleSave = async () => {
    // The form handles the API call, so we just refresh the list and go back
    await loadQuotations();
    setSelectedQuotation(null);
    setView("list");
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-gray-950">
      {view === "list" ? (
        <QuotationList
          quotations={quotations}
          loading={loading}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack}
        />
      ) : (
        <QuotationForm
          editData={selectedQuotation}
          onBack={() => {
            setView("list");
            setSelectedQuotation(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Quotation;