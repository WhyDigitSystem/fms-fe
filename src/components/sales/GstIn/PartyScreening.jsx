import { useCallback, useState } from "react";
import PartyScreeningForm from "./PartyScreeningForm";
import PartyScreeningList from "./PartyScreeningList";
import { initialParties } from "./GstData";

// Frontend-only container. Swap `initialParties` / the handlers for API calls later.
const PartyScreening = ({ onBack }) => {
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");
  const [parties, setParties] = useState(initialParties);

  const goList = useCallback(() => {
    setSelected(null);
    setView("list");
  }, []);

  const handleSave = useCallback(
    (form) => {
      const clash = parties.some(
        (p) =>
          p.id !== form.id &&
          p.entityName === form.entityName &&
          p.partyType === form.partyType,
      );
      if (clash) {
        setToast(
          `${form.entityName} already exists as ${form.partyType}. Existing record kept.`,
        );
        goList();
        return;
      }
      if (form.id) {
        setParties((prev) => prev.map((p) => (p.id === form.id ? form : p)));
        setToast(`Screening for ${form.entityName} updated.`);
      } else {
        setParties((prev) => [{ ...form, id: Date.now() }, ...prev]);
        setToast(`Screening for ${form.entityName} saved.`);
      }
      goList();
    },
    [parties, goList],
  );

  return (
    <div className="min-h-full bg-slate-50 dark:bg-gray-950">
      {view === "list" ? (
        <PartyScreeningList
          parties={parties}
          toast={toast}
          onDismissToast={() => setToast("")}
          onNew={() => {
            setToast("");
            setSelected(null);
            setView("form");
          }}
          onOpen={(p) => {
            setToast("");
            setSelected(p);
            setView("form");
          }}
          onBack={onBack}
        />
      ) : (
        <PartyScreeningForm
          key={selected?.id ?? "new"}
          record={selected}
          onSave={handleSave}
          onBack={goList}
        />
      )}
    </div>
  );
};

export default PartyScreening;
