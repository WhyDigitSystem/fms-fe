import { useCallback, useEffect, useRef, useState } from "react";
import BookingAPI from "../../../api/sales/bookingAPI";
import BookingForm from "./Bookingform";
import Bookinglist from "./Bookinglist";

const Booking = ({ onBack }) => {
  const [view, setView] = useState("list");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toast, setToast] = useState("");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const orgId = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const branchId = parseInt(localStorage.getItem("branchId")) || orgId;

  // Guard against setState after unmount / double-fetch races
  const fetchTokenRef = useRef(0);

  const fetchBookings = useCallback(async () => {
    const token = ++fetchTokenRef.current;
    try {
      setLoading(true);
      const res = await BookingAPI.getBookingByOrgId(branchId, orgId);

      // ✅ Handle every common response shape
      const list =
        res?.paramObjectsMap?.bookingVOList ||
        res?.paramObjectsMap?.bookingList ||
        res?.paramObjectsMap?.bookingVO ||
        res?.data ||
        res;

      if (token !== fetchTokenRef.current) return; // stale response

      setBookings(Array.isArray(list) ? list : []);
    } catch (error) {
      if (token !== fetchTokenRef.current) return;
      console.error("❌ Booking.jsx: Failed to load bookings", error);
      setToast("Failed to load bookings.");
      setBookings([]);
    } finally {
      if (token === fetchTokenRef.current) setLoading(false);
    }
  }, [branchId, orgId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ✅ Called by BookingForm after every successful save/submit/status change.
  //    `saved` is the hydrated form object so we can show its bookingNo.
  const handleSaveSuccess = useCallback(
    async (saved) => {
      if (saved?.bookingNo) {
        setToast(`Booking ${saved.bookingNo} saved.`);
      }
      await fetchBookings();
      setSelectedBooking(null);
      setView("list");
    },
    [fetchBookings],
  );

  const goList = () => {
    setSelectedBooking(null);
    setView("list");
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-gray-950">
      {view === "list" ? (
        <Bookinglist
          bookings={bookings}
          loading={loading}
          toast={toast}
          onDismissToast={() => setToast("")}
          onReload={fetchBookings}
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
          key={selectedBooking?.id ?? "new"}
          editData={selectedBooking}
          onBack={goList}
          onSaveSuccess={handleSaveSuccess}
          onNotify={setToast}
        />
      )}
    </div>
  );
};

export default Booking;