import Sales from "../components/sales/Sales";
import Enquiry from "../components/sales/Enquiry/Enquiry";
import Quotation from "../components/sales/quotation/Quotation";
import Booking from "../components/sales/booking/Booking";
import JobWorkspace from "../components/sales/JobWorkspace/JobWorkspace";
import Job from "../components/sales/JobWorkspace/Job";
import PreJobOpeningMaster from "../components/sales/PreJobOpening/PreJobOpeningMaster";

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
];

export default salesRoutes;
