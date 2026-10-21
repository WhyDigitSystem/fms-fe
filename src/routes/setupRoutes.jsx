import Setup from "../components/setUp/Setup";
import Configuration from "../components/setUp/Configuration/Configuration";

const setupRoutes = [
  {
    path: "setup",
    element: <Setup />,
  },
  {
    path: "configuration",
    element: <Configuration />,
  },
];

export default setupRoutes;
