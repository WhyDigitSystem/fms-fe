import Sales from "../components/sales/Sales";
import Enquiry from "../components/sales/Enquiry/Enquiry";
import Quotation from "../components/sales/quotation/Quotation";
import Booking from "../components/sales/booking/Booking";
import JobWorkspace from "../components/sales/JobWorkspace/JobWorkspace";
import Job from "../components/sales/JobWorkspace/Job";
import PreJobOpeningMaster from "../components/sales/PreJobOpening/PreJobOpeningMaster";
import Pdfformat1 from "../components/pdf/Pdfformat1";
import Pdfformat2 from "../components/pdf/Pdfformat2";

const salesRoutes = [
  {
    path: "sales",
    element: <Sales />,
  },
  {
    path: "enquiry",
    element: <Enquiry />,
  },
  {
    path: "quotation",
    element: <Quotation />,
  },
  {
    path: "pre-job-opening",
    element: <PreJobOpeningMaster />,
  },
  {
    path: "booking",
    element: <Booking />,
  },
  {
    path: "job-workspace",
    element: <Job />,
  },

  //Pdfformat1 and Pdfformat2 are used for testing purpose only, they are not part of the application
  {
    path: "Pdfformat1",
    element: <Pdfformat1 />,
  },
  {
    path: "Pdfformat2",
    element: <Pdfformat2 />,
  },
];

export default salesRoutes;
