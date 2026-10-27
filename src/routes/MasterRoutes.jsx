import Master from "../components/masters/Master";

import CountryMaster from "../components/masters/country/CountryMaster";
import StateMaster from "../components/masters/state/StateMaster";
import CityMaster from "../components/masters/city/CityMaster";
import User from "../components/masters/user/User";
import EmployeeMasterPage from "../components/masters/employee/EmployeeMaster";

import DocType from "../components/masters/DocType/DocTypeMaster";
import DocumentMapping from "../components/masters/DocMapping/DocumentMapping";
import FinYear from "../components/masters/finyear/Finyear";
import ScreenNames from "../components/masters/screens/ScreenNames";
import ScreenAccess from "../components/masters/screenAccess/screenAccess";

import CreateCompanyPage from "../components/masters/createCompany/companyMaster";
import BranchMaster from "../components/masters/branch/BranchMaster";
import RolesAndResponsibilitySetup from "../components/masters/rolesResponsibilities/RolesAndResponsibilitySetup";
import DepartmentMasterPage from "../components/masters/Department/DepartmentMaster";
import DesignationMasterPage from "../components/masters/Designation/DesignationMaster";
import ServiceMaster from "../components/masters/service/ServiceMaster";
import ProductMaster from "../components/masters/product/ProductMaster";
import PortMaster from "../components/masters/PortMaster/PortMaster";
import ModeMaster from "../components/masters/ModeMaster/ModeMaster";

const masterRoutes = [
  {
    path: "master",
    element: <Master />,
  },
  {
    path: "country",
    element: <CountryMaster />,
  },
  {
    path: "state",
    element: <StateMaster />,
  },
  {
    path: "city",
    element: <CityMaster />,
  },
  {
    path: "department",
    element: <DepartmentMasterPage />,
  },
  {
    path: "designation",
    element: <DesignationMasterPage />,
  },
  {
    path: "document-type",
    element: <DocType />,
  },
  {
    path: "document-type-mapping",
    element: <DocumentMapping />,
  },
  {
    path: "financial-year",
    element: <FinYear />,
  },
  {
    path: "screens",
    element: <ScreenNames />,
  },
  {
    path: "screen-access",
    element: <ScreenAccess />,
  },
  {
    path: "new-entries",
    element: <CreateCompanyPage />,
  },
  {
    path: "branch",
    element: <BranchMaster />,
  },
  {
    path: "roles",
    element: <RolesAndResponsibilitySetup />,
  },
  {
    path: "user",
    element: <User />,
  },
  {
    path: "employee",
    element: <EmployeeMasterPage />,
  },
  {
    path: "service",
    element: <ServiceMaster />,
  },
  {
    path: "product",
    element: <ProductMaster />,
  },
  {
    path: "port",
    element: <PortMaster />,
  },
  {
    path: "mode",
    element: <ModeMaster />,
  },
];

export default masterRoutes;
