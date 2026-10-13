import { useState } from "react";
import QuotationList from "./QuotationList";
import QuotationForm from "./QuotationForm";

const initialQuotations = [
  {
    id: 1,
    quotationNo: "QTN/26-27/0001",
    quotationDate: "2026-10-12",
    expirationDate: "2026-10-31",
    company: "Altius SA",
    service: "Door to Airport",
    currency: "EUR",
    paymentTerms: "Cash on delivery",
    incoterm: "EXW",
    originCode: "BCN",
    originCity: "Barcelona",
    destinationCode: "NBO",
    destinationCity: "Nairobi",
    status: "Sent",
    customerName: "Uniworld Logistics Pvt Ltd",
    customerPhone: "918040833366",
    customerEmail: "corporate@uniworld-logistic.com",
    customerAddress: "225, 5th Main, 4th Block, Karamangala, Bangalore 560034",
    agentName: "Irene Alemparte",
    agentPhone: "986446446",
    agentEmail: "ialemparte@grupoaltius.com",
    packages: [
      { id: 1, quantity: "6", weight: "14", weightUnit: "kg", length: "39", width: "29", height: "35", dimensionUnit: "cm", cargoType: "General", cargoDescription: "Pharma" },
      { id: 2, quantity: "1", weight: "12", weightUnit: "kg", length: "60", width: "40", height: "41", dimensionUnit: "cm", cargoType: "General", cargoDescription: "Pharma" },
      { id: 3, quantity: "1", weight: "6.3", weightUnit: "kg", length: "30", width: "24", height: "20", dimensionUnit: "cm", cargoType: "General", cargoDescription: "Pharma" },
    ],
    originCharges: [
      { id: 1, description: "Inspections", rate: "40", rateUnit: "Inspection", minimumCharge: "", quantity: "1", basis: "Per Shipment", notes: "" },
      { id: 2, description: "Documents (AWB, HAWB)", rate: "20", rateUnit: "Shipment", minimumCharge: "", quantity: "1", basis: "Per Shipment", notes: "" },
      { id: 3, description: "Handling", rate: "0.09", rateUnit: "Ch. Kg", minimumCharge: "45", quantity: "102.3", basis: "Chargeable Weight", notes: "167 kg/m3" },
      { id: 4, description: "Security (X-Ray)", rate: "0.15", rateUnit: "Kg Actual", minimumCharge: "28", quantity: "102.3", basis: "Gross Weight", notes: "" },
      { id: 5, description: "Airport Fee", rate: "0.03", rateUnit: "Ch. Kg", minimumCharge: "5", quantity: "102.3", basis: "Chargeable Weight", notes: "" },
      { id: 6, description: "Pick Up with temp. control", rate: "95", rateUnit: "Shipment", minimumCharge: "", quantity: "1", basis: "Per Shipment", notes: "" },
      { id: 7, description: "Customs Clearance", rate: "40", rateUnit: "Shipment", minimumCharge: "", quantity: "1", basis: "Per Shipment", notes: "Up to 5 HSC, then 5 per additional HSC" },
    ],
    airRates: [
      { id: 1, airlineName: "Qatar Airways", airlineCode: "QR", productName: "QR PHARMA", destinationCode: "NBO", transitVia: "", rateType: "+100kg", minimumWeight: "", ratePerKg: "2.80", fuelRate: "", riskRate: "", remarks: "All-in" },
      { id: 2, airlineName: "Emirates", airlineCode: "EK", productName: "SkyPharma (AXS COL)", destinationCode: "NBO", transitVia: "", rateType: "+100kg", minimumWeight: "", ratePerKg: "3.85", fuelRate: "0.21", riskRate: "", remarks: "" },
    ],
    insurancePercentage: "0.35",
    cargoValue: "",
    profitSharingPercentage: "50",
    bankExchangePercentage: "2",
    freeStorageDays: "1",
    storageRate: "15",
    storageMinimumCharge: "60",
    rateValidityRemarks: "Rates subject to space availability at the time of booking.",
    terms: "Inland 1 CBM = 333 KG.\nPick up services consol 24/48 hours.",
    remarks: "",
  },
];

const Quotation = ({ onBack }) => {
  const [view, setView] = useState("list");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [quotations, setQuotations] = useState(initialQuotations);

  const handleAddNew = () => {
    setSelectedQuotation(null);
    setView("add");
  };

  const handleEdit = (quotation) => {
    setSelectedQuotation(quotation);
    setView("edit");
  };

  const handleSave = (formData) => {
    if (formData.id) {
      setQuotations((prev) =>
        prev.map((item) => (item.id === formData.id ? { ...formData } : item)),
      );
    } else {
      const nextId = Math.max(0, ...quotations.map((item) => item.id)) + 1;

      setQuotations((prev) => [
        {
          ...formData,
          id: nextId,
          quotationNo: `QTN/26-27/${String(nextId).padStart(4, "0")}`,
          status: formData.status || "Draft",
        },
        ...prev,
      ]);
    }

    setSelectedQuotation(null);
    setView("list");
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-gray-950">
      {view === "list" ? (
        <QuotationList
          quotations={quotations}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack}
        />
      ) : (
        <QuotationForm
          editData={selectedQuotation}
          onBack={() => {
            setView("list");
            setSelectedQuotation(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Quotation;
