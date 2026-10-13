import {
  FileText,
  Mail,
  BarChart3,
  Award,
  PenTool,
  TrendingUp,
  Settings,
  Truck,
  Users,
  Filter,
  MoreHorizontal,
  PlusCircle,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AuctionDashboard = () => {
  const auctionStats = [
    { title: "Open RFQ (Daily)", value: 12, color: "text-blue-500" },
    { title: "Unallotted (Daily)", value: 7, color: "text-amber-500" },
    { title: "Pending Allotment (Daily)", value: 5, color: "text-red-500" },
    { title: "Awarded (Daily)", value: 15, color: "text-green-500" },
  ];

  const processSteps = [
    { label: "RFQ", icon: FileText },
    { label: "Send Request", icon: Mail },
    { label: "Bid Analysis", icon: BarChart3 },
    { label: "Approve & Award", icon: Award },
    { label: "E-Sign", icon: PenTool },
    { label: "Rate Analysis", icon: TrendingUp },
  ];

  const quickLinks = [
    {
      category: "RFQ",
      items: ["RFQ List", "RFQ Response"],
      icon: FileText,
    },
    {
      category: "Auctions",
      items: ["Auction List", "Auction Report"],
      icon: BarChart3,
    },
    {
      category: "Config",
      items: ["Route", "Vehicle Type"],
      icon: Settings,
    },
    {
      category: "Vendors",
      items: ["Vendor List", "Tag List"],
      icon: Users,
    },
  ];

  const chartData = [
    { date: "01-Nov", value: 2 },
    { date: "03-Nov", value: 4 },
    { date: "05-Nov", value: 3 },
    { date: "07-Nov", value: 5 },
    { date: "09-Nov", value: 2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            🏆 Auction
          </h1>
          <button className="mt-3 md:mt-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow transition-all">
            <PlusCircle className="h-4 w-4" /> Create Workspace
          </button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {auctionStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 hover:shadow-md transition"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stat.title}
              </p>
              <p className={`text-2xl font-semibold mt-1 ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Process Flow */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center flex-wrap gap-6">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center relative"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm mb-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {step.label}
                  </p>
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-6 right-[-60px] w-[50px] h-[2px] bg-gray-300 dark:bg-gray-600" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickLinks.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.category}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 hover:shadow-md transition"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {section.category}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition"
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Auction Volume Chart */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Auction Volume
            </h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600">
                <Filter className="h-4 w-4" /> Last Month
              </button>
              <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderRadius: "8px",
                    border: "none",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDashboard;
