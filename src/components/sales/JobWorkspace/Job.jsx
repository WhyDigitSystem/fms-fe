import { useCallback, useState } from "react";
import JobWorkspace from "./JobWorkspace";
import Joblist from "./Joblist";
import { emptyJob, finalizeNewJob, initialJobs } from "./Jobdata";

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

  const handleNew = useCallback(() => {
    setToast("");
    setSelectedJob(emptyJob());
    setView("workspace");
  }, []);

  const handleCreate = useCallback(
    (form) => {
      const created = finalizeNewJob(form, jobs);
      setJobs((prev) => [created, ...prev]);
      setToast(`Job ${created.jobNo} created.`);
      setSelectedJob(null);
      setView("list");
    },
    [jobs],
  );

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
          onNew={handleNew}
          onOpen={(job) => {
            setToast("");
            setSelectedJob(job);
            setView("workspace");
          }}
          onBack={onBack}
        />
      ) : (
        <JobWorkspace
          key={selectedJob?.id ?? "new"}
          job={selectedJob}
          onBack={goList}
          onCreate={handleCreate}
          onNotify={setToast}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default Job;
