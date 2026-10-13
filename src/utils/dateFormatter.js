import dayjs from "dayjs";

export const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateForDisplay = (dateString) => {
  if (!dateString) return "";
  try {
    if (dateString.includes("-")) {
      const parts = dateString.split("-");
      if (parts[0].length === 4) {
        return dayjs(dateString, "YYYY-MM-DD").format("DD/MM/YYYY");
      } else if (parts[0].length === 2) {
        return dateString;
      }
    }
    return dayjs(dateString).format("DD/MM/YYYY");
  } catch (error) {
    console.warn("Date formatting error:", error, dateString);
    return dateString;
  }
};

export const formatDateForAPI = (dateString) => {
  if (!dateString) return null;
  try {
    if (dateString.includes("-") && dateString.split("-")[0].length === 4) {
      return dateString;
    }
    if (dateString.includes("-") && dateString.split("-")[0].length === 2) {
      const date = new Date(dateString.split("-").reverse().join("-"));
      return date.toISOString().split("T")[0];
    }
    return null;
  } catch (error) {
    console.warn("Date API conversion error:", error, dateString);
    return null;
  }
};

export const appendGNToDocumentId = (docId) => {
  const index = docId.indexOf("DK");
  if (index !== -1) {
    return `${docId.slice(0, index + 2)}GN${docId.slice(index + 2)}`;
  }
  return docId;
};
