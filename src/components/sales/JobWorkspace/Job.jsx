import { useCallback, useState } from "react";
import JobWorkspace from "./JobWorkspace";
import Joblist from "./Joblist";
import { initialJobs } from "./Jobdata";

// Frontend-only container. Swap `initialJobs` / the handlers for API calls later.
const Job = ({ onBack }) => {
  const [view, setView] = useState("list");
  const [selectedJob, setSelectedJob] = useState(null);
  const [toast, setToast] = useState("");
  const [jobs, setJobs] = useState(initialJobs);

  const goList = useCallback(() => {
    setSelectedJob(null);
    setView("list");
  }, []);

  const handleStatusChange = useCallback((id, status) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
    setSelectedJob((prev) =>
      prev && prev.id === id ? { ...prev, status } : prev,
    );
    setToast(`Job status updated to ${status}.`);
  }, []);

  return (
    <div className="min-h-full bg-slate-50 dark:bg-gray-950">
      {view === "list" ? (
        <Joblist
          jobs={jobs}
          toast={toast}
          onDismissToast={() => setToast("")}
          onOpen={(job) => {
            setToast("");
            setSelectedJob(job);
            setView("workspace");
          }}
          onBack={onBack}
        />
      ) : (
        <JobWorkspace
          key={selectedJob?.id}
          job={selectedJob}
          onBack={goList}
          onNotify={setToast}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default Job;
