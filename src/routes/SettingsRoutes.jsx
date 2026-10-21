import SettingsDashboard from "../components/settings/SettingsDashboard";
import UserManagement from "../components/settings/UserManagement";
import ProfileSettings from "../components/settings/Profile";

const settingsRoutes = [
  {
    path: "settings",
    element: <SettingsDashboard />,
  },
  {
    path: "settings/users",
    element: <UserManagement />,
  },
  {
    path: "settings/profile",
    element: <ProfileSettings />,
  },
];

export default settingsRoutes;
