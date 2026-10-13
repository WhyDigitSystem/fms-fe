import { useState } from "react";
import Roles from "./Roles";
import Responsibilities from "./Responsibilities";

const RolesAndResponsibilitySetup = () => {
    const [activeTab, setActiveTab] = useState("roles");

    return (
        <div className="max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Roles & Responsibilities
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Manage roles and their associated responsibilities
            </p>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab("roles")}
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "roles"
                                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        Roles
                    </button>
                    <button
                        onClick={() => setActiveTab("responsibilities")}
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "responsibilities"
                                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        Responsibilities
                    </button>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === "roles" && <Roles />}
                    {activeTab === "responsibilities" && <Responsibilities />}
                </div>
            </div>
        </div>
    );
};

export default RolesAndResponsibilitySetup;