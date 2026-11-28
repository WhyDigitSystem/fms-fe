import { useCallback, useState } from "react";
import GstInForm from "./GstInForm";
import GstInList from "./GstInList";
import { effectiveStatus, initialGstRecords, initialParties } from "./GstData";

// Frontend-only container. Swap the initial data / handlers for API calls later.
// `parties` is the Party Screening data; replace it with a lookup against your KYC API.
const GstIn = ({ onBack }) => {
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");
  const [records, setRecords] = useState(initialGstRecords);
  const [parties] = useState(initialParties);

  const goList = useCallback(() => {
    setSelected(null);
    setView("list");
  }, []);

  const getScreeningStatus = useCallback(
    (name) => {
      const p = parties.find((x) => x.entityName === name);
      return p ? effectiveStatus(p) : "";
    },
    [parties],
  );

  const handleSave = useCallback(
    (form) => {
      if (form.id) {
        setRecords((prev) => prev.map((r) => (r.id === form.id ? form : r)));
        setToast(`GST IN for ${form.partyName} updated.`);
      } else {
        setRecords((prev) => [{ ...form, id: Date.now() }, ...prev]);
        setToast(`GST IN for ${form.partyName} saved.`);
      }
      goList();
    },
    [goList],
  );

  return (
    <div className="min-h-full bg-slate-50 dark:bg-gray-950">
      {view === "list" ? (
        <GstInList
          records={records}
          toast={toast}
          onDismissToast={() => setToast("")}
          onNew={() => {
            setToast("");
            setSelected(null);
            setView("form");
          }}
          onOpen={(r) => {
            setToast("");
            setSelected(r);
            setView("form");
          }}
          onBack={onBack}
        />
      ) : (
        <GstInForm
          key={selected?.id ?? "new"}
          record={selected}
          existingPans={records
            .filter((r) => r.id !== selected?.id)
            .map((r) => r.pan)}
          parties={parties}
          getScreeningStatus={getScreeningStatus}
          onSave={handleSave}
          onBack={goList}
        />
      )}
    </div>
  );
};

export default GstIn;
