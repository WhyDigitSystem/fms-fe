import { useState } from "react";
import EnquiryList from "./EnquiryList";
import EnquiryForm from "./EnquiryForm";

const initialEnquiries = [
  {
    id: 1,
    enquiryNo: "ENQ/26-27/0001",
    enquiryDate: "2026-10-12",
    customer: "ABC Exports",
    movement: "Export",
    mode: "Sea",
    origin: "Bengaluru",
    destination: "Hamburg",
    cargo: "Electronics",
    pol: "Bengaluru ICD",
    pod: "Port of Hamburg",
    status: "Open",
    cargoDetails: {
      cargoType: "LCL",
      containers: "",
      cbm: "10",
      weight: "2000",
      packages: "",
      length: "",
      width: "",
      height: "",
      vehicleType: "",
    },
  },
  {
    id: 2,
    enquiryNo: "ENQ/26-27/0002",
    enquiryDate: "2026-10-11",
    customer: "Global Traders",
    movement: "Import",
    mode: "Air",
    origin: "Frankfurt",
    destination: "Bengaluru",
    cargo: "Industrial Machinery",
    pol: "Frankfurt Airport (FRA)",
    pod: "Kempegowda International Airport (BLR)",
    status: "Quoted",
    cargoDetails: {
      cargoType: "",
      containers: "",
      cbm: "",
      weight: "450",
      packages: "5",
      length: "100",
      width: "80",
      height: "60",
      vehicleType: "",
    },
  },
  {
    id: 3,
    enquiryNo: "ENQ/26-27/0003",
    enquiryDate: "2026-10-10",
    customer: "Acme Industries",
    movement: "Export",
    mode: "Road",
    origin: "Bengaluru",
    destination: "Mumbai",
    cargo: "Automotive Components",
    pol: "Bengaluru Road Terminal",
    pod: "Mumbai Road Freight Terminal",
    status: "Open",
    cargoDetails: {
      cargoType: "",
      containers: "",
      cbm: "",
      weight: "1200",
      packages: "24",
      length: "",
      width: "",
      height: "",
      vehicleType: "Truck",
    },
  },
];

const Enquiry = ({ onBack }) => {
  const [view, setView] = useState("list");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [enquiries, setEnquiries] = useState(initialEnquiries);

  const handleAddNew = () => {
    setSelectedEnquiry(null);
    setView("add");
  };

  const handleEdit = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setView("edit");
  };

  const handleSave = (formData) => {
    if (formData.id) {
      setEnquiries((prev) =>
        prev.map((item) => (item.id === formData.id ? { ...formData } : item)),
      );
    } else {
      const nextId = Math.max(0, ...enquiries.map((item) => item.id)) + 1;

      setEnquiries((prev) => [
        {
          ...formData,
          id: nextId,
          enquiryNo: `ENQ/26-27/${String(nextId).padStart(4, "0")}`,
          status: "Open",
        },
        ...prev,
      ]);
    }

    setSelectedEnquiry(null);
    setView("list");
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-gray-950">
      {view === "list" ? (
        <EnquiryList
          enquiries={enquiries}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack}
        />
      ) : (
        <EnquiryForm
          editData={selectedEnquiry}
          onBack={() => {
            setView("list");
            setSelectedEnquiry(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Enquiry;
