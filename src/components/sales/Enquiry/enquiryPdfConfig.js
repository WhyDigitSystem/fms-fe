/* Mode-dependent enquiry PDF (Sea / Air / Road) in the Delivery-Order design.
 * `data` = the raw enquiry record from the API. */
const mode = (d) => String(d.shipmentMode || d.mode || "").toUpperCase();
const is = (m) => (d) => mode(d) === m;

const originLoc = (d) =>
  ({ SEA: d.originPort, AIR: d.originAirport, ROAD: d.originTerminal })[
    mode(d)
  ] ||
  d.originPort ||
  d.originAirport ||
  d.originTerminal;
const destLoc = (d) =>
  ({
    SEA: d.destinationPort,
    AIR: d.destinationAirport,
    ROAD: d.destinationTerminal,
  })[mode(d)] ||
  d.destinationPort ||
  d.destinationAirport ||
  d.destinationTerminal;

const portLabel = (loc) =>
  loc ? `${loc.portName || ""}${loc.portCode ? ` (${loc.portCode})` : ""}` : "";
const title = (v) =>
  String(v || "")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (s) => s.toUpperCase());

export const enquiryPdfConfig = {
  layout: "split", // logo + title left, ENQUIRY NO. / DATE / STATUS right, same row
  title: (d) => `${mode(d)} FREIGHT ENQUIRY`,
  fileName: (d) => `Enquiry-${d.docId || "Draft"}`,

  // "To:" on the left (e.g. APACKS), tinted ENQUIRY NO. / DATE / STATUS table on the right
  party: {
    label: "To:",
    accessor: (d) =>
      d.company ||
      d.customerName ||
      d.customer?.customerName ||
      (typeof d.customer === "string" ? d.customer : ""),
  },
  // shown under the header rule: Dear Sir + intro line
  intro: [
    "Dear Sir,",
    (d) =>
      `Please find the ${title(mode(d))} freight (${title(d.movement)}) enquiry details below.`,
  ],
  meta: [
    { label: "Enquiry No.", accessor: "docId" },
    { label: "Date", accessor: "docDate", format: "date" },
    { label: "Status", accessor: (d) => d.status || "Open" },
  ],

  sections: [
    {
      type: "detailTable",
      gapBefore: 18,
      headers: ["ENQUIRY DETAILS", "PARTICULARS"],
      rows: [
        { label: "Company", accessor: (d) => d.company || d.customer },
        { label: "Movement", accessor: (d) => title(d.movement) },
        { label: "Mode", accessor: (d) => title(mode(d)) },
        { label: "Origin", accessor: (d) => portLabel(originLoc(d)) },
        { label: "Destination", accessor: (d) => portLabel(destLoc(d)) },
        {
          label: "Cargo Type",
          accessor: (d) => d.cargoType?.valuesDescription,
        },
        {
          label: "Cargo Group",
          accessor: (d) => d.cargoGroup?.valuesDescription,
        },
        {
          label: "Gross Weight",
          accessor: "grossWeightKg",
          format: "number",
          suffix: " kg",
          extra: {
            label: "Volume",
            accessor: "volumeCbm",
            format: "number",
            suffix: " cbm",
          },
          when: is("SEA"),
        },
        {
          label: "Gross Weight",
          accessor: "grossWeightKg",
          format: "number",
          suffix: " kg",
          extra: {
            label: "Packages",
            accessor: "noOfPackages",
            format: "number",
            decimals: 0,
          },
          when: (d) => !is("SEA")(d),
        },
        {
          label: "Dimensions",
          accessor: (d) =>
            `${d.lengthCm || 0} x ${d.widthCm || 0} x ${d.heightCm || 0} cm`,
          when: is("AIR"),
        },
        { label: "Vehicle Type", accessor: "vehicleType", when: is("ROAD") },
        { label: "Description", accessor: "cargoDescription", tall: true },
      ],
    },
    {
      type: "text",
      gapBefore: 16,
      size: 7.6,
      color: "muted",
      lineHeight: 11,
      lines: [
        "Rates and schedules are subject to carrier space and confirmation at the time of booking.",
        "Cargo details above are as declared by the customer and may be revised after verification.",
      ],
    },
  ],

  footer: { left: (d) => `Enquiry No. : ${d.docId || ""}` },
};
