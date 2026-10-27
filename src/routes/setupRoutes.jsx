import ConfigMaster from "../components/setUp/ConfigMaster/ConfigMaster";
import Setup from "../components/setUp/Setup";

const setupRoutes = [
  {
    path: "setup",
    element: <Setup />,
  },
  {
    path: "configuration",
    element: <ConfigMaster />,
  },
];

export default setupRoutes;
