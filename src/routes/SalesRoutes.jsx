import Sales from "../components/sales/Sales";
import Enquiry from "../components/sales/Enquiry/Enquiry";
import Quotation from "../components/sales/quotation/Quotation";
import Booking from "../components/sales/booking/Booking";

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
    path: "booking",
    element: <Booking />,
  },
];

export default salesRoutes;
