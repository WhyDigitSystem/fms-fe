import {
    AlertTriangle,
    Boxes,
    Building2,
    CalendarCheck,
    Coins,
    FileText,
    Flag,
    GitBranch,
    GitMerge,
    Globe,
    Grid3x3,
    IdCard,
    Landmark,
    Layers,
    Map,
    MapPin,
    Monitor,
    Shield,
    PlusCircle,
    Tag,
    UserCheck,
    UserPlus,
    Users,
    Warehouse,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hasScreenAccess } from "../../utils/accessControl";

const Setup = () => {
    const navigate = useNavigate();
    const userType = localStorage.getItem('userType')?.toUpperCase();

    const company = [
        {
            name: "New Entries",
            icon: PlusCircle,
            path: "/new-entries",
            color: "indigo",
            screenCode: "NEWE",
            sadminOnly: true
        }
    ];

    const filteredMasters = company.filter(item => {
        if (userType === 'SADMIN') {
            return true;
        }
        const hasAccess = hasScreenAccess(item.screenCode);
        return hasAccess;
    });

    console.log(`Filtered Setup items count: ${filteredMasters.length}`);

    // If no masters available, show a message
    if (filteredMasters.length === 0) {
        return (
            <div className="max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                    Company
                </h1>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No stock process screens available for your role</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        User Type: {localStorage.getItem('userType') || 'None'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Create Company Data
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-5">
                {filteredMasters.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className="cursor-pointer group bg-white dark:bg-gray-800 
              border border-gray-200 dark:border-gray-700 p-4 rounded-2xl 
              shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                        >
                            <div
                                className={`p-3 rounded-xl bg-${item.color}-100 dark:bg-${item.color}-900/30
                text-${item.color}-600 dark:text-${item.color}-400 mb-3 inline-flex`}
                            >
                                <Icon className="h-5 w-5" />
                            </div>

                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                                {item.name}
                            </h3>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Setup;