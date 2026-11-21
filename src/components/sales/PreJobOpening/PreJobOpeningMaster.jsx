import { useCallback, useEffect, useRef, useState } from "react";
import PreJobAPI from "../../../api/sales/preJobAPI";
import PreJobOpeningForm from "./PreJobOpeningForm";
import PreJobOpeningList from "./PreJobOpeningList";

const PreJobOpeningMaster = ({ onBack }) => {
    const [view, setView] = useState("list");
    const [selectedJob, setSelectedJob] = useState(null);
    const [toast, setToast] = useState("");

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const orgId = parseInt(localStorage.getItem("orgId")) || 1000000001;
    const branchId = parseInt(localStorage.getItem("branchId")) || orgId;

    const fetchTokenRef = useRef(0);

    const fetchJobs = useCallback(async () => {
        const token = ++fetchTokenRef.current;
        try {
            setLoading(true);
            const res = await PreJobAPI.getPreJobByOrgIdAndBranch(branchId, orgId);

            // Map the API response to the List View format
            const list = (res || []).map((job) => ({
                id: job.id,
                preJobNo: job.docId,
                date: job.docDate,
                customer: job.customer,
                origin: job.origin?.portName || "-",
                destination: job.destination?.portName || "-",
                status: job.cancel === "T" ? "Cancelled" : (job.docStatus || "Draft"), // Fallback if no status
                rawData: job // Keep raw data if needed
            }));

            if (token !== fetchTokenRef.current) return;
            setJobs(list);
        } catch (error) {
            if (token !== fetchTokenRef.current) return;
            console.error("❌ Failed to load pre-jobs", error);
            setToast("Failed to load pre-jobs.");
            setJobs([]);
        } finally {
            if (token === fetchTokenRef.current) setLoading(false);
        }
    }, [branchId, orgId]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleSaveSuccess = useCallback(
        async (saved) => {
            if (saved?.preJobNo) {
                setToast(`Pre-Job ${saved.preJobNo} saved.`);
            }
            await fetchJobs();
            setSelectedJob(null);
            setView("list");
        },
        [fetchJobs],
    );

    const goList = () => {
        setSelectedJob(null);
        setView("list");
    };

    return (
        <div className="min-h-full bg-slate-50 dark:bg-gray-950">
            {view === "list" ? (
                <PreJobOpeningList
                    jobs={jobs}
                    loading={loading}
                    toast={toast}
                    onDismissToast={() => setToast("")}
                    onReload={fetchJobs}
                    onAddNew={() => {
                        setToast("");
                        setSelectedJob(null);
                        setView("form");
                    }}
                    onEdit={(job) => {
                        setToast("");
                        // Pass the full raw API data to the form
                        setSelectedJob(job.rawData);
                        setView("form");
                    }}
                    onBack={onBack}
                />
            ) : (
                <PreJobOpeningForm
                    key={selectedJob?.id ?? "new"}
                    editData={selectedJob}
                    onBack={goList}
                    onSaveSuccess={handleSaveSuccess}
                    onNotify={setToast}
                />
            )}
        </div>
    );
};

export default PreJobOpeningMaster;