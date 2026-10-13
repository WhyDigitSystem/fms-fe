// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardCheck,
  Filter,
  PackageCheck,
  PackagePlus,
  ScanBarcode,
  Truck,
  Warehouse,
  RefreshCw,
  Eye,
  X,
  PieChart as PieChartIcon,
  Activity,
  Package,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Grid,
  List,
  Box,
  PackageOpen,
  PackageX,
  MapPin,
  AlertTriangle
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import dashboardAPI from "../api/dashboardAPI";
import dayjs from "dayjs";
import { useToast } from "../components/Toast/ToastContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [detailedView, setDetailedView] = useState({
    type: "",
    title: "",
    data: [],
    open: false
  });

  const { addToast } = useToast();
  const [overallStock, setOverallStock] = useState({
    totalStock: "0",
    partCount: 0,
    itemCount: 0,
    loading: false
  });

  // Global parameters from localStorage
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginBranch = globalParam?.branch || localStorage.getItem("branch") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const loginCustomer = globalParam?.customer || localStorage.getItem("customer") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";
  const orgId = localStorage.getItem("orgId");
  const loginFinYear = globalParam?.finYear || localStorage.getItem("finYear") || "";

  // State for warehouse bin details modal
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [warehouseBinData, setWarehouseBinData] = useState([]);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [holdMaterials, setHoldMaterials] = useState([]);
  const [expiryProducts, setExpiryProducts] = useState([]);
  const [criticalStockLevel, setCriticalStockLevel] = useState([]);
  const [timeFilter, setTimeFilter] = useState('yesterday');
  const [binFilters, setBinFilters] = useState({
    binStatus: "",
    bin: "",
    partNo: "",
  });

  // Super Power Modal state
  const [superPowerModalOpen, setSuperPowerModalOpen] = useState(false);

  // Modal states for Hold Materials and Expiry Products
  const [holdMaterialModal, setHoldMaterialModal] = useState({
    open: false,
    data: [],
    title: ''
  });

  const [expiryModal, setExpiryModal] = useState({
    open: false,
    data: [],
    title: ''
  });

  const [criticalStockModal, setCriticalStockModal] = useState({
    open: false,
    data: [],
    title: ''
  });

  const fetchOverallStock = async () => {
    if (!orgId || !loginBranchCode || !loginClient || !loginWarehouse) {
      console.warn("Missing required parameters for overall stock");
      return;
    }

    setOverallStock(prev => ({ ...prev, loading: true }));

    try {
      const today = dayjs().format("YYYY/MM/DD");

      const payload = {
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer || "CASIO PVT LTD",
        orgId: orgId,
        partNo: "ALL",
        warehouse: loginWarehouse,
        asondt: today
      };

      console.log("📦 Sending GET request with params:", payload);
      const stockData = await dashboardAPI.getOverallStock(payload);
      console.log("📦 Stock API response data:", stockData);

      if (stockData.status) {
        console.log("✅ Stock data received successfully");

        const formattedTotalStock = stockData.totalStock?.toLocaleString('en-IN') || "0";
        console.log("📊 Formatted Total Stock:", formattedTotalStock);

        setOverallStock({
          totalStock: formattedTotalStock,
          partCount: stockData.partCount || 0,
          itemCount: stockData.itemCount || 0,
          stockDetails: stockData.stockDetails || [],
          loading: false
        });

        setDashboardData(prev => ({
          ...prev,
          totalStock: stockData.totalStock?.toString() || "0"
        }));
      } else {
        console.error("Failed to fetch overall stock:", stockData.error);
        setOverallStock(prev => ({
          ...prev,
          loading: false
        }));
      }
    } catch (error) {
      console.error("Error fetching overall stock:", error);
      setOverallStock(prev => ({
        ...prev,
        loading: false
      }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchDashboardData(),
        fetchOverallStock()
      ]);
    };

    fetchData();

    const interval = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Dashboard Data States
  const [dashboardData, setDashboardData] = useState({
    totalStock: "0",
    inboundToday: "0",
    outboundToday: "0",
    pendingPutaway: "0",

    stockSummary: {
      fastMoving: 0,
      slowMoving: 0,
      nearExpiry: 0,
      damaged: 0,
    },

    stockDistData: [
      { name: "Available", value: 0 },
      { name: "Reserved", value: 0 },
      { name: "Damaged", value: 0 },
      { name: "In Transit", value: 0 },
    ],

    inboundOutboundData: [],
    capacityUtilization: [{ name: "Used", value: 0 }, { name: "Free", value: 100 }],
    efficiencyTrend: [],

    grn: { completed: [], pending: [] },
    putaway: { completed: [], pending: [] },
    buyerOrder: { completed: [], pending: [] },
    pickRequest: { completed: [], pending: [] },
    warehouseOccupancy: { occupied: 0, available: 0 }
  });

  // State for individual data arrays
  const [completedGRNData, setCompletedGRNData] = useState([]);
  const [pendingGRNData, setPendingGRNData] = useState([]);
  const [completedPutawayData, setCompletedPutawayData] = useState([]);
  const [pendingPutawayData, setPendingPutawayData] = useState([]);
  const [completedBuyerOrderData, setCompletedBuyerOrderData] = useState([]);
  const [pendingBuyerOrderData, setPendingBuyerOrderData] = useState([]);
  const [completedPickRequestData, setCompletedPickRequestData] = useState([]);
  const [pendingPickRequestData, setPendingPickRequestData] = useState([]);

  // Get current month for API calls
  const currentMonth = dayjs().format("YYYY-MM");

  // QUICK ACTIONS LIST
  const shortcuts = [
    { name: "Inbound", icon: PackagePlus, path: "/inbound", gradient: "from-green-500 to-green-600" },
    { name: "Outbound", icon: PackageCheck, path: "/outbound", gradient: "from-purple-500 to-purple-600" },
    { name: "Inventory", icon: Boxes, path: "/reports/stock-summary", gradient: "from-blue-500 to-blue-600" },
    { name: "GRN", icon: ClipboardCheck, path: "/inbound/grn", gradient: "from-indigo-500 to-indigo-600" },
    { name: "Bin Utilization", icon: Warehouse, path: "/reports/binUtilization", gradient: "from-pink-500 to-pink-600" },
    { name: "Location Status", icon: MapPin, path: "/reports/location_status", gradient: "from-cyan-500 to-cyan-600" },
  ];

  // Colors for charts
  const stockDistColors = ["#6366F1", "#22C55E", "#EF4444", "#F59E0B"];
  const capacityColors = ["#10B981", "#E5E7EB"];

  const showHoldCard = holdMaterials?.length > 0;
  const showExpiryCard = expiryProducts?.length > 0;
  const showCriticalCard = criticalStockLevel?.length > 0;

  const handleOverallStockClick = () => {
    if (overallStock.stockDetails && overallStock.stockDetails.length > 0) {
      handleOpenDetailedView(
        "Overall Stock Details",
        overallStock.stockDetails,
        "overallStock"
      );
    } else if (overallStock.loading) {
      addToast("Stock data is still loading...", "info");
    } else {
      addToast("Fetching stock details...", "info");
      fetchOverallStock().then(() => {
        if (overallStock.stockDetails && overallStock.stockDetails.length > 0) {
          handleOpenDetailedView(
            "Overall Stock Details",
            overallStock.stockDetails,
            "overallStock"
          );
        } else {
          addToast("No stock details available", "warning");
        }
      });
    }
  };

  // Handler functions for modals
  const handleViewHoldMaterials = () => {
    setHoldMaterialModal({
      open: true,
      data: holdMaterials,
      title: 'Hold Materials'
    });
  };

  const handleViewExpiryProducts = () => {
    setExpiryModal({
      open: true,
      data: expiryProducts,
      title: 'Expiry Products'
    });
  };

  const handleViewCriticalStockLevel = () => {
    setCriticalStockModal({
      open: true,
      data: criticalStockLevel,
      title: 'Low Stock Level Products'
    });
  };

  // Warehouse Layout Component
  const WarehouseLayout = ({ binData, warehouseName }) => {
    const [loading, setLoading] = useState(false);
    const [layoutBins, setLayoutBins] = useState([]);
    const [selectedBin, setSelectedBin] = useState(null);
    const [binDetails, setBinDetails] = useState(null);

    useEffect(() => {
      const organizeLayout = async () => {
        if (!binData || binData.length === 0) {
          setLayoutBins([]);
          return;
        }

        const groupedByLevel = {};
        binData.forEach(bin => {
          const level = bin.level || 'Unknown';
          if (!groupedByLevel[level]) {
            groupedByLevel[level] = [];
          }
          groupedByLevel[level].push(bin);
        });

        const organizedBins = {};
        Object.keys(groupedByLevel).sort().forEach(level => {
          const levelBins = groupedByLevel[level];
          const groupedByRow = {};

          levelBins.forEach(bin => {
            const rowNo = bin.rowNo || 'Unknown';
            if (!groupedByRow[rowNo]) {
              groupedByRow[rowNo] = [];
            }
            groupedByRow[rowNo].push(bin);
          });

          Object.keys(groupedByRow).sort().forEach(rowNo => {
            groupedByRow[rowNo].sort((a, b) => {
              const binA = a.bin || '';
              const binB = b.bin || '';
              return binA.localeCompare(binB);
            });
          });

          organizedBins[level] = groupedByRow;
        });

        setLayoutBins(organizedBins);
      };

      organizeLayout();
    }, [binData]);

    const getBinColor = (binStatus) => {
      switch (binStatus) {
        case 'Occupied': return '#14857bff';
        case 'Empty': return '#08dd4fff';
        case 'Reserved': return '#ffb74d';
        case 'Damaged': return '#f44336';
        default: return 'rgba(255, 255, 255, 0.3)';
      }
    };

    const getBinTextColor = (binStatus) => {
      return binStatus === 'Empty' ? 'text-gray-800' : 'text-white';
    };

    const handleBinClick = async (bin) => {
      setSelectedBin(bin);
      try {
        const details = await dashboardAPI.getBinDetails(
          orgId,
          loginBranchCode,
          loginWarehouse,
          loginClient,
          bin.bin
        );
        setBinDetails(details);
      } catch (error) {
        console.error("Error fetching bin details:", error);
        setBinDetails([]);
      }
    };

    const validBins = binData.filter(bin => bin && (bin.bin || bin.binStatus));

    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading warehouse layout...</p>
        </div>
      );
    }

    if (validBins.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No bin data available for layout view
        </div>
      );
    }

    const occupiedCount = validBins.filter(b => b.binStatus === "Occupied").length;
    const emptyCount = validBins.filter(b => b.binStatus === "Empty").length;
    const reservedCount = validBins.filter(b => b.binStatus === "Reserved").length;
    const damagedCount = validBins.filter(b => b.binStatus === "Damaged").length;
    const otherCount = validBins.filter(b => !["Occupied", "Empty", "Reserved", "Damaged"].includes(b.binStatus)).length;

    return (
      <div className="warehouse-layout-container bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-6 text-white shadow-2xl border border-gray-700/50">
        {/* Layout Grid */}
          {Object.keys(layoutBins).map(level => {
            const rows = layoutBins[level];

            return (
              <div key={level} className="mb-0 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-2 backdrop-blur-sm border border-gray-700/50 shadow-lg hover:shadow-cyan-500/10 transition-shadow">
                <div className="text-center mb-2 relative">
                  <h4 className="text-lg font-bold text-white mb-1 inline-block bg-gray-800 px-4 py-1 rounded-full relative">
                    <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                      Level {level}
                    </span>
                  </h4>
                </div>

                {Object.keys(rows).sort().map(rowNo => {
                  const rowBins = rows[rowNo];

                  return (
                    <div key={`${level}-${rowNo}`} className="mb-8 last:mb-0 group">
                      <div className="flex items-center justify-between mb-4 pl-2 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                          <div className="text-sm font-medium text-gray-300">
                            Row {rowNo}
                            <span className="text-cyan-400 ml-2 font-bold">({rowBins.length} bins)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
                        {rowBins.map((bin, index) => {
                          let Icon = Box;
                          let iconColor = "";
                          let pulse = false;

                          switch (bin.binStatus) {
                            case 'Occupied':
                              Icon = Package;
                              iconColor = "text-[#14857bff]";
                              pulse = true;
                              break;
                            case 'Empty':
                              Icon = PackageX;
                              iconColor = "text-[#08dd4fff]";
                              break;
                            case 'Reserved':
                              Icon = Clock;
                              iconColor = "text-yellow-400";
                              pulse = true;
                              break;
                            case 'Damaged':
                              Icon = AlertCircle;
                              iconColor = "text-red-400";
                              pulse = true;
                              break;
                            default:
                              Icon = Box;
                              iconColor = "text-gray-400";
                          }

                          return (
                            <button
                              key={index}
                              onClick={() => handleBinClick(bin)}
                              className={`
                                w-16 h-10 rounded-xl border-2 
                                flex items-center justify-center text-xs font-bold
                                transition-all duration-300 hover:scale-110 hover:shadow-xl hover:z-10
                                hover:border-[#6C63FF] hover:shadow-[0_0_20px_rgba(108,99,255,0.5)]
                                ${getBinTextColor(bin.binStatus)}
                                relative overflow-hidden group/bin
                              `}
                              style={{
                                backgroundColor: getBinColor(bin.binStatus),
                                borderColor: `${getBinColor(bin.binStatus)}80`,
                              }}
                              title={`${bin.bin} - ${bin.binStatus || 'Unknown'}${bin.partNo ? `\nPart: ${bin.partNo}` : ''
                                }${bin.quantity ? `\nQty: ${bin.quantity}` : ''}`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover/bin:opacity-100 transition-opacity"></div>

                              {pulse && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                              )}

                              <div className={`absolute top-1.5 left-1.5 ${iconColor} drop-shadow-lg`}>
                                <Icon className={`w-3 h-3 ${pulse ? 'animate-pulse' : ''}`} />
                              </div>

                              <div className="text-xs font-bold drop-shadow-md relative z-10">
                                {bin.bin || `BIN-${index + 1}`}
                              </div>

                              {bin.partNo && (
                                <div className="absolute bottom-1 right-1">
                                  <span className="text-[7px] font-semibold bg-black/40 text-white px-1 py-0.5 rounded">
                                    {bin.partNo.substring(0, 3)}{bin.partNo.length > 3 ? '...' : ''}
                                  </span>
                                </div>
                              )}

                              {bin.quantity && bin.binStatus === 'Occupied' && (
                                <div className="absolute -bottom-1 -right-1">
                                  <span className="text-[6px] font-bold bg-green-500 text-white px-1 py-0.5 rounded-full">
                                    {bin.quantity > 99 ? '99+' : bin.quantity}
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

        {/* Enhanced Bin Details Popup */}
        {selectedBin && binDetails && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl shadow-2xl max-w-md w-full border border-gray-700/70 backdrop-blur-xl">
              <div className="p-5 border-b border-gray-700/50 flex justify-between items-center bg-gradient-to-r from-gray-800/80 to-gray-900/80">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${(() => {
                    switch (selectedBin.binStatus) {
                      case 'Occupied': return 'bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30';
                      case 'Empty': return 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30';
                      case 'Reserved': return 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30';
                      case 'Damaged': return 'bg-gradient-to-br from-red-500/20 to-pink-600/20 border border-red-500/30';
                      default: return 'bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30';
                    }
                  })()}`}>
                    {(() => {
                      let Icon = Box;
                      switch (selectedBin.binStatus) {
                        case 'Occupied': Icon = Package; break;
                        case 'Empty': Icon = PackageX; break;
                        case 'Reserved': Icon = Clock; break;
                        case 'Damaged': Icon = AlertCircle; break;
                        default: Icon = Box;
                      }
                      return <Icon className="h-5 w-5" style={{ color: getBinColor(selectedBin.binStatus) }} />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Bin Details</h3>
                    <p className="text-sm text-gray-300">{selectedBin.bin}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedBin(null);
                    setBinDetails(null);
                  }}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-6">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2`}
                    style={{
                      backgroundColor: getBinColor(selectedBin.binStatus) + '30',
                      color: getBinTextColor(selectedBin.binStatus).includes('white') ? 'white' : 'inherit',
                      border: `1px solid ${getBinColor(selectedBin.binStatus)}50`
                    }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getBinColor(selectedBin.binStatus) }}></div>
                    Status: {selectedBin.binStatus || "Unknown"}
                  </div>
                  {selectedBin.rowNo && selectedBin.level && (
                    <div className="px-4 py-2 bg-gray-700/50 rounded-full text-sm text-gray-300 flex items-center gap-2 border border-gray-600/50">
                      <MapPin className="h-3.5 w-3.5" />
                      Row {selectedBin.rowNo} • Level {selectedBin.level}
                    </div>
                  )}
                </div>

                {binDetails.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contents</h4>
                    {binDetails.map((detail, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/50 hover:border-cyan-500/30 transition-colors group">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 group-hover:scale-110 transition-transform">
                            <Package className="h-6 w-6 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex flex-col">
                                <h4 className="font-bold text-white text-lg">
                                  {detail.partNo || "N/A"}
                                </h4>
                                <h6 className="text-white">
                                  {detail.partDesc || "N/A"}
                                </h6>
                              </div>
                              <span className="text-sm bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">
                                Qty: {detail.avilQty || detail.availableQty || detail.quantity || "0"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="flex justify-center mb-6">
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50">
                        {(() => {
                          let Icon = Box;
                          switch (selectedBin.binStatus) {
                            case 'Occupied': Icon = Package; break;
                            case 'Empty': Icon = PackageX; break;
                            case 'Reserved': Icon = Clock; break;
                            case 'Damaged': Icon = AlertCircle; break;
                            default: Icon = Box;
                          }
                          return <Icon className="h-16 w-16" style={{ color: getBinColor(selectedBin.binStatus) }} />;
                        })()}
                      </div>
                    </div>
                    <p className="text-gray-400 mb-4 text-lg">No detailed information available</p>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-gray-700/50 flex justify-end bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-b-2xl">
                <button
                  onClick={() => {
                    setSelectedBin(null);
                    setBinDetails(null);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all duration-300 font-medium hover:shadow-lg hover:shadow-blue-500/25"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Material Details Modal Component
  const MaterialDetailsModal = ({ isOpen, onClose, data, title }) => {
    if (!isOpen) return null;

    // Determine if it's hold material or expiry products
    const isHoldMaterial = title === 'Hold Materials';
    const quantityKey = isHoldMaterial ? 'holdQty' : 'qty';

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              {data && data.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Total {data.length} item{data.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {data && data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b-2 border-gray-200 dark:border-gray-600">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        S.No
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Part No
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[200px]">
                        Description
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        GRN No
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        GRN Date
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Expiry Date
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {item.partNo || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                          <div className="group relative">
                            <span className="block truncate max-w-[200px]">
                              {item.partDesc || 'N/A'}
                            </span>
                            {item.partDesc && item.partDesc.length > 25 && (
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                                <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg whitespace-normal">
                                  {item.partDesc}
                                  <div className="absolute left-4 top-full border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                          {item.sku || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                            {item[quantityKey] || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                          {item.grnNo || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                          {item.grnDate ? dayjs(item.grnDate).format('DD-MM-YYYY') : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${item.expDate && dayjs(item.expDate).diff(dayjs(), 'days') < 7
                            ? 'text-red-600 dark:text-red-400'
                            : item.expDate && dayjs(item.expDate).diff(dayjs(), 'days') < 30
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-gray-700 dark:text-gray-300'
                            }`}>
                            {item.expDate ? dayjs(item.expDate).format('DD-MM-YYYY') : 'N/A'}
                            {item.days && (
                              <span className={`ml-1 text-xs ${item.days < 7
                                ? 'text-red-500 dark:text-red-400'
                                : item.days < 30
                                  ? 'text-yellow-500 dark:text-yellow-400'
                                  : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                ({item.days} days)
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-green-400 dark:border-green-500 text-green-600 dark:text-green-400 text-xs font-medium">
                            {item.bin || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3" />
                  <p className="text-lg font-medium">No {title.toLowerCase()} found</p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {data && data.length > 0 && (
                <span>Showing {data.length} item{data.length > 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CriticalStockModal = ({ isOpen, onClose, data, title }) => {
    if (!isOpen) return null;

    // Determine if it's hold material or expiry products
    const isHoldMaterial = title === 'Hold Materials';
    const quantityKey = isHoldMaterial ? 'holdQty' : 'qty';

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              {data && data.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Total {data.length} item{data.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {data && data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b-2 border-gray-200 dark:border-gray-600">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        S.No
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Part No
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[200px]">
                        Description
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Low QTY
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Client
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {item.partNo || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                          <div className="group relative">
                            <span className="block truncate max-w-[200px]">
                              {item.partDesc || 'N/A'}
                            </span>
                            {item.partDesc && item.partDesc.length > 25 && (
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                                <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg whitespace-normal">
                                  {item.partDesc}
                                  <div className="absolute left-4 top-full border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                          {item.sku || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                            {item[quantityKey] || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                          {item.criticalStockLevel || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                          {item.client || ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3" />
                  <p className="text-lg font-medium">No {title.toLowerCase()} found</p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {data && data.length > 0 && (
                <span>Showing {data.length} item{data.length > 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Filter warehouse bin data
  const filteredBinData = warehouseBinData.filter(bin => {
    if (binFilters.binStatus && bin.binStatus !== binFilters.binStatus) return false;
    if (binFilters.bin && !bin.bin?.toLowerCase().includes(binFilters.bin.toLowerCase())) return false;
    if (binFilters.partNo && !bin.partNo?.toLowerCase().includes(binFilters.partNo.toLowerCase())) return false;
    return true;
  });

  // Handle opening detailed view
  const handleOpenDetailedView = (title, data, type) => {
    setDetailedView({
      type,
      title,
      data,
      open: true
    });
  };

  // Handle closing detailed view
  const handleCloseDetailedView = () => {
    setDetailedView({
      type: "",
      title: "",
      data: [],
      open: false
    });
  };

  // Render detailed view table
  const renderDetailedTable = (data, type) => {
    let columns = [];

    switch (type) {
      case "grnCompleted":
        columns = [
          { header: "GRN No", key: "grnNo" },
          { header: "GRN Date", key: "grnDate", format: (date) => dayjs(date).format("DD-MM-YYYY") },
          { header: "Qty", key: "qty" },
        ];
        break;
      case "grnPending":
        columns = [
          { header: "GRN No", key: "grnNo" },
          { header: "GRN Date", key: "grnDate", format: (date) => dayjs(date).format("DD-MM-YYYY") },
          { header: "Qty", key: "qty" },
        ];
        break;
      case "putawayCompleted":
        columns = [
          { header: "Putaway No", key: "putawayNo" },
          { header: "Reference No", key: "refNo" },
          { header: "Qty", key: "qty" },
        ];
        break;
      case "putawayPending":
        columns = [
          { header: "Putaway No", key: "putawayNo" },
          { header: "Reference No", key: "refNo" },
          { header: "Qty", key: "qty" },
        ];
        break;
      default:
        columns = [];
    }

    return (
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {col.format ? col.format(item[col.key]) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    if (!orgId || !loginBranchCode || !loginClient || !loginWarehouse) {
      console.warn("Missing required parameters for dashboard");
      return;
    }

    setIsLoading(true);
    try {
      const [
        grnData,
        putawayData,
        buyerOrderData,
        pickRequestData,
        occupancyData,
        stockSummary,
        holdData,
        expiryData,
        criticalStockLevel
      ] = await Promise.all([
        dashboardAPI.getGRNData(orgId, loginBranchCode, loginClient, loginFinYear, loginWarehouse, currentMonth, timeFilter),
        dashboardAPI.getPutawayData(orgId, loginBranchCode, loginClient, loginFinYear, currentMonth, timeFilter),
        dashboardAPI.getBuyerOrderData(orgId, loginBranchCode, loginClient, loginFinYear, loginWarehouse, timeFilter),
        dashboardAPI.getPickRequestData(orgId, loginBranchCode, loginClient, loginFinYear, timeFilter),
        dashboardAPI.getWarehouseOccupancy(orgId, loginBranchCode, loginWarehouse, loginClient),
        dashboardAPI.getStockSummary(orgId, loginBranchCode, loginClient, loginWarehouse),
        dashboardAPI.getHoldMaterialCount(
          orgId,
          loginBranchCode,
          loginWarehouse,
          loginClient
        ),
        dashboardAPI.getExpiryProducts(
          orgId,
          loginBranchCode,
          loginWarehouse,
          loginClient
        ),
        dashboardAPI.getCriticalStockLevel(
          orgId,
          loginBranchCode,
          loginWarehouse,
          loginClient
        )
      ]);

      console.log("Dashboard API Responses:", {
        grnData, putawayData, buyerOrderData, pickRequestData, occupancyData, stockSummary,
        holdData, expiryData, criticalStockLevel
      });

      // Set the hold materials and expiry products state
      setHoldMaterials(holdData || []);
      setExpiryProducts(expiryData || []);
      setCriticalStockLevel(criticalStockLevel || []);

      setCompletedGRNData(grnData.completed || []);
      setPendingGRNData(grnData.pending || []);
      setCompletedPutawayData(putawayData.completed || []);
      setPendingPutawayData(putawayData.pending || []);
      setCompletedBuyerOrderData(buyerOrderData.completed || []);
      setPendingBuyerOrderData(buyerOrderData.pending || []);
      setCompletedPickRequestData(pickRequestData.completed || []);
      setPendingPickRequestData(pickRequestData.pending || []);

      const occupied = occupancyData.occupied || 0;
      const available = occupancyData.available || 0;
      const pendingPutaway = putawayData.pending?.length || 0;

      const inboundOutboundData = [
        { day: "Mon", in: grnData.completed?.length || 0, out: buyerOrderData.completed?.length || 0 },
        { day: "Tue", in: 52, out: 41 },
        { day: "Wed", in: 48, out: 38 },
        { day: "Thu", in: 61, out: 45 },
        { day: "Fri", in: 55, out: 42 },
        { day: "Sat", in: 38, out: 29 },
        { day: "Sun", in: 42, out: 31 },
      ];

      const efficiencyTrend = [
        { day: "Mon", value: 78 },
        { day: "Tue", value: 82 },
        { day: "Wed", value: 85 },
        { day: "Thu", value: 88 },
        { day: "Fri", value: 86 },
        { day: "Sat", value: 80 },
        { day: "Sun", value: 76 },
      ];

      const inboundToday = grnData.completed?.length || 0;
      const outboundToday = buyerOrderData.completed?.length || 0;
      // const outboundToday = buyerOrderData.completed?.length || 0;

      setDashboardData({
        totalStock: stockSummary.totalStock?.toString() || "0",
        inboundToday: inboundToday.toString(),
        outboundToday: outboundToday.toString(),
        pendingPutaway: pendingPutaway.toString(),

        stockSummary: {
          fastMoving: stockSummary.fastMoving || 0,
          slowMoving: stockSummary.slowMoving || 0,
          nearExpiry: stockSummary.nearExpiry || 0,
          damaged: stockSummary.damaged || 0,
        },

        stockDistData: [
          { name: "Available", value: Math.floor((stockSummary.totalStock || 0) * 0.7) },
          { name: "Reserved", value: Math.floor((stockSummary.totalStock || 0) * 0.15) },
          { name: "Damaged", value: stockSummary.damaged || 0 },
          { name: "In Transit", value: Math.floor((stockSummary.totalStock || 0) * 0.1) },
        ],

        inboundOutboundData,
        capacityUtilization: [
          { name: "Used", value: Math.round((occupied / (occupied + available || 1)) * 100) },
          { name: "Free", value: 100 - Math.round((occupied / (occupied + available || 1)) * 100) }
        ],
        efficiencyTrend,

        grn: grnData,
        putaway: putawayData,
        buyerOrder: buyerOrderData,
        pickRequest: pickRequestData,
        warehouseOccupancy: { occupied, available }
      });

      console.log("Hold Materials set:", holdData);
      console.log("Expiry Products set:", expiryData);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setHoldMaterials([]);
      setExpiryProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch warehouse bin details
  const fetchWarehouseBinDetails = async () => {
    setWarehouseLoading(true);
    console.log("🔍 Fetching warehouse bin details...");

    try {
      const response = await dashboardAPI.getWarehouseOccupancy(
        orgId,
        loginBranchCode,
        loginWarehouse,
        loginClient
      );

      console.log("📦 API Response:", response);

      if (response.status && response.binDetails) {
        console.log("✅ Bin details received:", response.binDetails.length);

        if (Array.isArray(response.binDetails)) {
          setWarehouseBinData(response.binDetails);

          setDashboardData(prev => ({
            ...prev,
            warehouseOccupancy: {
              occupied: response.occupied,
              available: response.available,
              total: response.total
            }
          }));

          console.log("✅ Bin data set successfully");
        } else {
          console.error("❌ Bin details is not an array:", response.binDetails);
          setWarehouseBinData([]);
        }
      } else {
        console.error("❌ API returned false status or no binDetails");
        setWarehouseBinData([]);
      }

      setWarehouseModalOpen(true);
      setViewMode("table");

    } catch (error) {
      console.error("💥 Error fetching warehouse bin details:", error);
      setWarehouseBinData([]);
      setWarehouseModalOpen(true);
    } finally {
      setWarehouseLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setBinFilters({
      binStatus: "",
      bin: "",
      partNo: "",
    });
  };
  console.log('Stock Values', overallStock);
  // KPI CARDS
  const kpis = [
    {
      title: "Total Parts",
      value: overallStock.partCount,
      icon: Boxes,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-gradient-to-r from-blue-500 to-blue-600"
    },
    {
      title: "Inbound",
      value: dashboardData.inboundToday,
      icon: PackagePlus,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-gradient-to-r from-green-500 to-green-600"
    },
    {
      title: "Outbound",
      value: dashboardData.outboundToday,
      icon: PackageCheck,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-gradient-to-r from-purple-500 to-purple-600"
    },
    {
      title: "Pending Putaway",
      value: dashboardData.pendingPutaway,
      icon: Warehouse,
      gradient: "from-amber-500 to-orange-500",
      bgColor: "bg-gradient-to-r from-amber-500 to-orange-500"
    },
  ];

  // Status Pie Chart Component
  const StatusPieChart = ({ title, completed, pending, colors, onCompletedClick, onPendingClick, id }) => {
    const data = [
      { name: 'Completed', value: completed },
      { name: 'Pending', value: pending }
    ];

    const total = completed + pending;
    const completedPercentage = total > 0 ? (completed / total) * 100 : 0;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">{title}</h3>
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-3">
            {total > 0 ? (
              <>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={colors.completed}
                    strokeWidth="20"
                    strokeDasharray={`${(completedPercentage / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={colors.pending}
                    strokeWidth="20"
                    strokeDasharray={`${((100 - completedPercentage) / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                    transform={`rotate(${completedPercentage * 3.6 - 90} 50 50)`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{total}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Data
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 w-full text-xs">
            <button
              onClick={onCompletedClick}
              className="flex items-center justify-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.completed }} />
              <span className="text-green-600 dark:text-green-400 font-medium">{completed}</span>
              <span className="text-gray-500 dark:text-gray-400">Completed</span>
            </button>
            <button
              onClick={onPendingClick}
              className="flex items-center justify-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.pending }} />
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">{pending}</span>
              <span className="text-gray-500 dark:text-gray-400">Pending</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto min-h-screen p-6 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const occupiedCount = warehouseBinData.filter(
    bin => bin.binStatus === "Occupied"
  ).length;

  const emptyCount = warehouseBinData.filter(
    bin => bin.binStatus === "Empty"
  ).length;

  const reservedCount = warehouseBinData.filter(
    bin => bin.binStatus === "Reserved"
  ).length;

  const damagedCount = warehouseBinData.filter(
    bin => bin.binStatus === "Damaged"
  ).length;

  const totalBins = warehouseBinData.length;

  return (
    <div className="max-w-7xl mx-auto min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 rounded-3xl p-2 shadow-lg text-white mb-4 overflow-hidden">
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold ml-4">Welcome to Your WMS Portal</h1>
          </div>

          <div className="flex items-center gap-3 ml-auto">

            {/* Tabs at the end */}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-lg p-0">
              <button
                onClick={() => setTimeFilter('today')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeFilter === 'today'
                  ? 'bg-white/30 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeFilter('yesterday')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeFilter === 'yesterday'
                  ? 'bg-white/30 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                Yesterday
              </button>
              <button
                onClick={() => setTimeFilter('this week')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeFilter === 'this week'
                  ? 'bg-white/30 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeFilter('this month')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeFilter === 'this month'
                  ? 'bg-white/30 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                This Month
              </button>
            </div>

            <button
              onClick={fetchWarehouseBinDetails}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-1.5 py-1.5 rounded-lg hover:bg-white/30 transition-all text-xs text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={warehouseLoading}
            >
              <Eye className="h-4 w-4" />
              Bin Layout
            </button>

            <button
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-1.5 py-1.5 rounded-lg hover:bg-white/30 transition-all text-xs text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-2">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isLoading = kpi.title === "Total SKU" && overallStock.loading;

          return (
            <div
              key={kpi.title}
              className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${kpi.bgColor} text-white shadow`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">{kpi.title}</h3>
                    {isLoading ? (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        <p className="text-xs text-gray-500">Loading...</p>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                        {kpi.title === "Total SKU"
                          ? overallStock.partCount
                          : kpi.value}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
          Quick Actions
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                onClick={() => navigate(item.path)}
                className="cursor-pointer rounded-lg relative overflow-hidden p-3 shadow-sm
              bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
              hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-10`} />

                <div className="relative flex flex-col items-center text-center">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} text-white shadow-sm`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="mt-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 truncate w-full">
                    {item.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STATUS CARDS SECTION */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
          Process Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusPieChart
            id="grn"
            title="GRN"
            completed={completedGRNData.length}
            pending={pendingGRNData.length}
            colors={{ completed: "#6DD5ED", pending: "#2193B0" }}
            onCompletedClick={() => handleOpenDetailedView(
              "Completed GRN",
              completedGRNData,
              "grnCompleted"
            )}
            onPendingClick={() => handleOpenDetailedView(
              "Pending GRN",
              pendingGRNData,
              "grnPending"
            )}
            compact={true}
          />

          <StatusPieChart
            id="putaway"
            title="Putaway"
            completed={completedPutawayData.length}
            pending={pendingPutawayData.length}
            colors={{ completed: "#00C49F", pending: "#FFBB28" }}
            onCompletedClick={() => handleOpenDetailedView(
              "Completed Putaway",
              completedPutawayData,
              "putawayCompleted"
            )}
            onPendingClick={() => handleOpenDetailedView(
              "Pending Putaway",
              pendingPutawayData,
              "putawayPending"
            )}
            compact={true}
          />

          <StatusPieChart
            id="buyerOrder"
            title="Orders"
            completed={completedBuyerOrderData.length}
            pending={pendingBuyerOrderData.length}
            colors={{ completed: "#FF8042", pending: "#FFBB28" }}
            onCompletedClick={() => handleOpenDetailedView(
              "Completed Buyer Orders",
              completedBuyerOrderData,
              "buyerOrderCompleted"
            )}
            onPendingClick={() => handleOpenDetailedView(
              "Pending Buyer Orders",
              pendingBuyerOrderData,
              "buyerOrderPending"
            )}
            compact={true}
          />

          <StatusPieChart
            id="pickRequest"
            title="Pick Request"
            completed={completedPickRequestData.length}
            pending={pendingPickRequestData.length}
            colors={{ completed: "#8884D8", pending: "#82CA9D" }}
            onCompletedClick={() => handleOpenDetailedView(
              "Completed Pick Requests",
              completedPickRequestData,
              "pickRequestCompleted"
            )}
            onPendingClick={() => handleOpenDetailedView(
              "Pending Pick Requests",
              pendingPickRequestData,
              "pickRequestPending"
            )}
            compact={true}
          />
        </div>
      </div>

      {/* WAREHOUSE OCCUPANCY CARD */}
      <div className="mb-4 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Warehouse Occupancy</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {loginWarehouse} - {loginClient}
            </p>
          </div>
          <button
            onClick={fetchWarehouseBinDetails}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm rounded-lg transition-all shadow"
            disabled={warehouseLoading}
          >
            <Eye className="h-4 w-4" />
            Bin Layout
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <div className="text-center">
              <div className="relative w-40 h-40 mx-auto">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800 dark:text-white">
                      {dashboardData.warehouseOccupancy.occupied}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Occupied</div>
                  </div>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="10"
                    strokeDasharray={`${((dashboardData.warehouseOccupancy.occupied / (dashboardData.warehouseOccupancy.occupied + dashboardData.warehouseOccupancy.available || 1)) * 251.2) || 0} 251.2`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{dashboardData.warehouseOccupancy.occupied}</div>
                  <div className="text-sm opacity-90">Occupied Bins</div>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{dashboardData.warehouseOccupancy.available}</div>
                  <div className="text-sm opacity-90">Available Bins</div>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <PackageOpen className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {dashboardData.warehouseOccupancy.occupied + dashboardData.warehouseOccupancy.available}
                  </div>
                  <div className="text-sm opacity-90">Total Bins</div>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Warehouse className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Storage Utilization</span>
            <span>
              {Math.round((dashboardData.warehouseOccupancy.occupied / (dashboardData.warehouseOccupancy.occupied + dashboardData.warehouseOccupancy.available || 1)) * 100) || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((dashboardData.warehouseOccupancy.occupied / (dashboardData.warehouseOccupancy.occupied + dashboardData.warehouseOccupancy.available || 1)) * 100) || 0}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Warehouse Bin Details Modal */}
      {warehouseModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col border border-white/20">
            <div className="p-4 border-b border-white/20 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Warehouse Bin Details - {loginWarehouse}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-300">
                    Client: {loginClient} | Total Bins: {warehouseBinData.length}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 md:mt-0 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                {[
                  { icon: Package, label: "Occupied", count: occupiedCount, color: "text-[#14857bff]", bg: "bg-[#14857bff]/20" },
                  { icon: PackageX, label: "Empty", count: emptyCount, color: "text-[#08dd4fff]", bg: "bg-[#08dd4fff]/20" },
                  { icon: Clock, label: "Reserved", count: reservedCount, color: "text-yellow-400", bg: "bg-yellow-500/20" },
                  { icon: AlertCircle, label: "Damaged", count: damagedCount, color: "text-red-400", bg: "bg-red-500/20" },
                  { icon: Box, label: "Total Bins", count: totalBins, color: "text-gray-400", bg: "bg-gray-500/20" }
                ].map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${item.bg} border border-gray-700/50 hover:scale-105 transition-transform`}>
                    <div className={`p-1.5 rounded-md ${item.bg}`}>
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-white">{item.label}</span>
                      <span className="text-xs text-gray-300 block">({item.count})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 overflow-auto flex-1 bg-gray-900/50">
              {viewMode === "layout" ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Bin Status
                    </label>
                    <select
                      value={binFilters.binStatus}
                      onChange={(e) => setBinFilters({ ...binFilters, binStatus: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Empty">Empty</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Damaged">Damaged</option>
                    </select>
                  </div>
                </div>
              ) : (
                <WarehouseLayout
                  binData={filteredBinData}
                  warehouseName={loginWarehouse}
                />
              )}
            </div>

            <div className="p-2 ml-4 border-t border-white/20 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {viewMode === "table"
                  ? `Total Bins: ${warehouseBinData.length} • Occupied: ${warehouseBinData.filter(b => b.binStatus === 'Occupied').length} • Empty: ${warehouseBinData.filter(b => b.binStatus === 'Empty').length}`
                  : `Click on any bin to view details | Showing ${filteredBinData.length} bins`
                }
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setWarehouseModalOpen(false)}
                  className="px-4 py-2 text-sm border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hold Material & Expiry Products Section */}
      {(showHoldCard || showExpiryCard || showCriticalCard) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Hold Material */}
          {showHoldCard && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-5 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Hold Item
                </h3>
                {holdMaterials && holdMaterials.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total: {holdMaterials.length}
                  </span>
                )}
              </div>

              <hr className="mb-4 border-gray-200 dark:border-gray-700" />

              {holdMaterials && holdMaterials.length > 0 ? (
                <>
                  {/* Table View */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Part
                          </th>
                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Bin
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdMaterials.slice(0, 3).map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                          >
                            <td className="py-2.5 px-2 text-gray-900 dark:text-white font-medium">
                              {item.partNo || 'N/A'}
                            </td>
                            <td className="py-2.5 px-2 text-gray-600 dark:text-gray-300">
                              <div className="group relative">
                                <span className="block truncate max-w-[120px] md:max-w-[200px]">
                                  {item.partDesc || 'N/A'}
                                </span>
                                {item.partDesc && item.partDesc.length > 20 && (
                                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                                    <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg">
                                      {item.partDesc}
                                      <div className="absolute left-4 top-full border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-right font-semibold text-gray-900 dark:text-white">
                              {item.holdQty || 0}
                            </td>
                            <td className="py-2.5 px-2 text-right font-semibold text-gray-900 dark:text-white">
                              {item.bin || ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* View All Button */}
                  <button
                    className="w-full mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center justify-center gap-2 py-2.5 border-t border-gray-200 dark:border-gray-700 mt-3 pt-3 transition-colors"
                    onClick={handleViewHoldMaterials}
                  >
                    View All ({holdMaterials.length})
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  No Hold Material
                </div>
              )}
            </div>
          )}

          {/* Expiry Products */}
          {showExpiryCard && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-5 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Expiry Item
                </h3>
                {expiryProducts && expiryProducts.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total: {expiryProducts.length}
                  </span>
                )}
              </div>

              <hr className="mb-4 border-gray-200 dark:border-gray-700" />

              {expiryProducts && expiryProducts.length > 0 ? (
                <>
                  {/* Table View */}
                  <div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Part
                          </th>
                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Expiry
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {expiryProducts.slice(0, 3).map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                          >
                            <td className="py-2.5 px-2 text-gray-900 dark:text-white font-medium">
                              {item.partNo || 'N/A'}
                            </td>
                            <td className="py-2.5 px-2 text-gray-600 dark:text-gray-300">
                              <div className="group relative">
                                <span className="block truncate max-w-[120px] md:max-w-[150px]">
                                  {item.partDesc || 'N/A'}
                                </span>
                                {item.partDesc && item.partDesc.length > 20 && (
                                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                                    <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg">
                                      {item.partDesc}
                                      <div className="absolute left-4 top-full border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-right font-semibold text-gray-900 dark:text-white">
                              {item.qty || 0}
                            </td>
                            <td className="py-2.5 px-2 text-right font-semibold text-gray-900 dark:text-white">
                              {item.expDate ? dayjs(item.expDate).format('DD-MM-YYYY') : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* View All Button */}
                  <button
                    className="w-full mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center justify-center gap-2 py-2.5 border-t border-gray-200 dark:border-gray-700 mt-3 pt-3 transition-colors"
                    onClick={handleViewExpiryProducts}
                  >
                    View All ({expiryProducts.length})
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  No Expiry Products
                </div>
              )}
            </div>
          )}

          {/* Third Card */}
          {showCriticalCard && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-5 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Low Stock
                </h3>
                {criticalStockLevel && criticalStockLevel.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total: {criticalStockLevel.length}
                  </span>
                )}
              </div>

              <hr className="mb-4 border-gray-200 dark:border-gray-700" />

              {criticalStockLevel && criticalStockLevel.length > 0 ? (
                <>
                  {/* Table View */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Part
                          </th>
                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            L Qty
                          </th>
                          <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Qty
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {criticalStockLevel.slice(0, 3).map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                          >
                            <td className="py-2.5 px-2 text-gray-900 dark:text-white font-medium">
                              {item.partNo || 'N/A'}
                            </td>
                            <td className="py-2.5 px-2 text-gray-600 dark:text-gray-300">
                              <div className="group relative">
                                <span className="block truncate max-w-[120px] md:max-w-[200px]">
                                  {item.partDesc || 'N/A'}
                                </span>
                                {item.partDesc && item.partDesc.length > 20 && (
                                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                                    <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg">
                                      {item.partDesc}
                                      <div className="absolute left-4 top-full border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-right font-semibold text-gray-900 dark:text-white">
                              {item.criticalStockLevel || 0}
                            </td>
                            <td className="py-2.5 px-2 text-right font-semibold text-gray-900 dark:text-white">
                              {item.qty || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* View All Button */}
                  <button
                    className="w-full mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center justify-center gap-2 py-2.5 border-t border-gray-200 dark:border-gray-700 mt-3 pt-3 transition-colors"
                    onClick={handleViewCriticalStockLevel}
                  >
                    View All ({criticalStockLevel.length})
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  No Low Stock Level Products
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Material Details Modals */}
      <MaterialDetailsModal
        isOpen={holdMaterialModal.open}
        onClose={() => setHoldMaterialModal({ open: false, data: [], title: '' })}
        data={holdMaterialModal.data}
        title={holdMaterialModal.title}
      />

      <MaterialDetailsModal
        isOpen={expiryModal.open}
        onClose={() => setExpiryModal({ open: false, data: [], title: '' })}
        data={expiryModal.data}
        title={expiryModal.title}
      />

      <CriticalStockModal
        isOpen={criticalStockModal.open}
        onClose={() => setCriticalStockModal({ open: false, data: [], title: '' })}
        data={criticalStockModal.data}
        title={criticalStockModal.title}
      />
    </div>
  );
};

export default Dashboard;