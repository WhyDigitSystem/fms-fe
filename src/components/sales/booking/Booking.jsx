import { useCallback, useEffect, useState } from "react";
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

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await BookingAPI.getBookingByOrgId(branchId, orgId);
      console.log("✅ Booking.jsx: Data fetched successfully", data);
      setBookings(data);
    } catch (error) {
      console.error("❌ Booking.jsx: Failed to load bookings", error);
      setToast("Failed to load bookings.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [branchId, orgId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSaveSuccess = useCallback(async () => {
    await fetchBookings();
    setSelectedBooking(null);
    setView("list");
  }, [fetchBookings]);

  const goList = () => {
    setSelectedBooking(null);
    setView("list");
  };

  console.log("🟢 Booking.jsx rendering. View:", view, "Bookings count:", bookings.length, "Loading:", loading);

  return (
    <div className="min-h-full bg-slate-50 dark:bg-gray-950">
      {view === "list" ? (
        <Bookinglist
          bookings={bookings}
          loading={loading}
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