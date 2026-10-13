import React from "react";
import {
  Users,
  UserCog,
  Bell,
  Building2,
  Shield,
  Settings,
  Globe,
  Key,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SettingsDashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "User Management",
      description: "Manage users, roles, and access levels",
      icon: Users,
      color: "from-blue-500 to-blue-700",
      route: "/settings/users",
    },
    {
      title: "Profile Settings",
      description: "Update your personal info and preferences",
      icon: UserCog,
      color: "from-purple-500 to-indigo-600",
      route: "/settings/profile",
    },
    {
      title: "Organization Settings",
      description: "Manage your company details and configuration",
      icon: Building2,
      color: "from-cyan-500 to-teal-600",
      route: "/settings/organization",
    },
    {
      title: "Security & Privacy",
      description: "Manage passwords, 2FA, and data access",
      icon: Shield,
      color: "from-red-500 to-rose-600",
      route: "/settings/security",
    },
    {
      title: "API & Integrations",
      description: "Manage API keys and connected apps",
      icon: Key,
      color: "from-yellow-500 to-amber-600",
      route: "/settings/api",
    },
    {
      title: "Notifications",
      description: "Configure alerts and email preferences",
      icon: Bell,
      color: "from-green-500 to-emerald-600",
      route: "/settings/notifications",
    },
    {
      title: "Regional & Language",
      description: "Adjust localization, timezone, and currency",
      icon: Globe,
      color: "from-pink-500 to-fuchsia-600",
      route: "/settings/regional",
    },
    {
      title: "System Preferences",
      description: "Customize app behavior and themes",
      icon: Settings,
      color: "from-slate-500 to-gray-700",
      route: "/settings/system",
    },
  ];

  return (
    <div className=" max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Configure your organization, profile, and system preferences.
            </p>
          </div>
        </div>

        {/* Settings Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(item.route)}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <div className="p-6 flex flex-col justify-between h-full">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title + Description */}
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer Arrow */}
                  <div className="mt-4 flex items-center justify-end text-blue-600 dark:text-blue-400">
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-10 text-center text-xs text-gray-400 dark:text-gray-500">
          © 2025 Efit WMS · Secure Settings Panel
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
