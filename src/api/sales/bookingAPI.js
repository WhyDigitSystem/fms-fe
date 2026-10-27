import apiClient from "../apiClient";

export const BookingAPI = {
    // ✅ Get All Bookings
    getBookingByOrgId: async (branchId, orgId) => {
        try {
            const res = await apiClient.get("/api/sales/getBookingByOrgId", {
                params: { branch: branchId, orgId },
            });
            const body = res;
            console.log("✅ BookingAPI.getBookingByOrgId response:", body);
            return body?.paramObjectsMap?.bookingResponseVO || [];
        } catch (error) {
            console.error("❌ Error fetching bookings:", error);
            throw error;
        }
    },

    // ✅ Get Booking By ID
    getBookingById: async (id) => {
        try {
            const res = await apiClient.get("/api/sales/getBookingById", {
                params: { id },
            });
            const body = res?.data ?? res;
            return body?.paramObjectsMap?.bookingVO || null;
        } catch (error) {
            console.error("❌ Error fetching booking by id:", error);
            throw error;
        }
    },

    // ✅ Fetch auto-generated Booking DocId
    getBookingDocId: async (orgId) => {
        try {
            const res = await apiClient.get("/api/sales/getBookingDocId", {
                params: { orgId },
            });
            const body = res?.data ?? res;
            return body?.paramObjectsMap?.bookingDocId ?? "";
        } catch (error) {
            console.error("❌ Error fetching booking DocId:", error);
            throw error;
        }
    },

    // ✅ Create / Update Booking
    createUpdateBooking: async (payload, files = []) => {
        try {
            const formData = new FormData();

            const jsonBlob = new Blob([JSON.stringify(payload)], {
                type: "application/json",
            });
            formData.append("bookingDTO", jsonBlob);

            if (files && files.length > 0) {
                files.forEach((file) => {
                    formData.append("files", file);
                });
            }

            const res = await apiClient.put(
                "/api/sales/createUpdateBooking",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return res?.data ?? res;
        } catch (error) {
            console.error("❌ Error saving booking:", error);
            throw error;
        }
    },
};

export default BookingAPI;