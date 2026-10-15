import { useCallback, useRef, useState } from "react";
import BookingList from "./BookingList";
import BookingForm from "./BookingForm";
import { CURRENT_USER, initialBookings, uid } from "./bookingData";

const FY = "26-27";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const auditEntry = (action, note = "") => ({
  id: uid(),
  at: new Date().toISOString(),
  by: CURRENT_USER.name,
  action,
  note,
});

const Booking = ({ onBack }) => {
  const [view, setView] = useState("list");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toast, setToast] = useState("");
  const [bookings, setBookings] = useState(initialBookings);

  // Mirrors state so async saves always see the latest records.
  const bookingsRef = useRef(initialBookings);
  // clientRequestId -> record id: a retried / double-clicked first save never creates a second record.
  const requestIds = useRef(new Map());

  const commit = (next) => {
    bookingsRef.current = next;
    setBookings(next);
  };

  /**
   * Replace the body of this function with your API call.
   * It must resolve with the saved record (including id + bookingNo) only after the
   * server confirms, and reject with an Error to show a message in the form.
   *
   * payload : full booking
   * meta    : { action: "draft" | "submit" | "status", label?, note? }
   */
  const handleSave = useCallback(async (payload, meta = {}) => {
    await wait(500); // simulated network latency

    const list = bookingsRef.current;
    const knownId =
      payload.id || requestIds.current.get(payload.clientRequestId) || 0;
    const existing = list.find((b) => b.id === knownId);
    const { clientRequestId, ...data } = payload;

    let record;

    if (existing) {
      let entry;
      if (meta.action === "submit")
        entry = auditEntry(
          existing.status === "Amendment Pending"
            ? "Re-submitted after amendment"
            : "Submitted for approval",
        );
      else if (meta.action === "status")
        entry = auditEntry(meta.label || `Status: ${data.status}`, meta.note);
      else entry = auditEntry("Booking updated");

      record = {
        ...existing,
        ...data,
        id: existing.id,
        bookingNo: existing.bookingNo,
        audit: [...existing.audit, entry],
      };
      commit(list.map((b) => (b.id === record.id ? record : b)));
    } else {
      const nextId = Math.max(0, ...list.map((b) => b.id)) + 1;
      const audit = [auditEntry("Draft saved")];
      if (meta.action === "submit")
        audit.push(auditEntry("Submitted for approval"));

      record = {
        ...data,
        id: nextId,
        bookingNo: `BKG/${FY}/${String(nextId).padStart(4, "0")}`, // assigned on first successful save
        audit,
      };
      requestIds.current.set(clientRequestId, nextId);
      commit([record, ...list]);
    }

    return record;
  }, []);

  const goList = () => {
    setSelectedBooking(null);
    setView("list");
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-gray-950">
      {view === "list" ? (
        <BookingList
          bookings={bookings}
          toast={toast}
          onDismissToast={() => setToast("")}
          onAddNew={() => {
            setToast("");
            setSelectedBooking(null);
            setView("form");
          }}
          onEdit={(booking) => {
            setToast("");
            setSelectedBooking(booking);
            setView("form");
          }}
          onBack={onBack}
        />
      ) : (
        <BookingForm
          // Re-mount when switching between records so state never leaks across bookings.
          key={selectedBooking?.id ?? "new"}
          editData={selectedBooking}
          onBack={goList}
          onSave={handleSave}
          onNotify={setToast}
        />
      )}
    </div>
  );
};

export default Booking;
