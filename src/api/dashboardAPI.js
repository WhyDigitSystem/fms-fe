// src/api/dashboardAPI.js
import apiClient from "./apiClient";

export const dashboardAPI = {
  // Get stock consolidation report
  // Update the getOverallStock function in dashboardAPI.js
  getOverallStock: async (payload) => {
    try {
      console.log("📦 Sending stock consolidation request:", payload);

      // Use GET method with query parameters
      const response = await apiClient.get(
        "/api/Reports/getStockConsolidation",
        {
          params: payload, // Send payload as query parameters
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📦 Stock consolidation API response:", response);

      // Handle different response structures
      let responseData;

      // If response has data property (standard axios response)
      if (response && response.data) {
        console.log("📍 Response has data property");
        responseData = response.data;
      }
      // If response is already the data object
      else if (response && response.statusFlag) {
        console.log("📍 Response is direct data object");
        responseData = response;
      }
      // If response is something else
      else {
        console.log("📍 Response structure unknown");
        responseData = response;
      }

      console.log("📊 Processed Stock Response Data:", responseData);

      if (
        responseData &&
        (responseData.status === true || responseData.statusFlag === "Ok")
      ) {
        console.log("✅ API returned success status");

        // Extract stock details from response
        let stockDetails = [];

        // Based on your response, the data is in paramObjectsMap.stockDetails
        if (
          responseData.paramObjectsMap &&
          responseData.paramObjectsMap.stockDetails
        ) {
          stockDetails = responseData.paramObjectsMap.stockDetails;
          console.log("📍 Found data in paramObjectsMap.stockDetails");
        } else if (responseData.stockDetails) {
          stockDetails = responseData.stockDetails;
          console.log("📍 Found data in stockDetails");
        }

        console.log("📦 Extracted Stock Details:", stockDetails);

        // Calculate total stock from avlQty values
        let totalStock = 0;
        let partCount = 0;

        if (stockDetails && Array.isArray(stockDetails)) {
          partCount = stockDetails.length;

          totalStock = stockDetails.reduce((sum, item) => {
            // Parse avlQty to number
            const qty = Number(item.avlQty) || 0;

            return sum + qty;
          }, 0);

          console.log("📊 Calculated Total Stock:", totalStock);
          console.log("📊 Part Count:", partCount);

          return {
            status: true,
            totalStock,
            partCount,
            itemCount: totalStock, // itemCount is same as totalStock
            stockDetails,
            rawResponse: responseData,
          };
        } else {
          console.log("📦 No stock details found or not an array");
          return {
            status: true,
            totalStock: 0,
            partCount: 0,
            itemCount: 0,
            stockDetails: [],
            rawResponse: responseData,
          };
        }
      } else {
        console.error("❌ Stock API returned error status:", responseData);
        return {
          status: false,
          error: responseData?.message || "API returned error status",
          totalStock: 0,
          partCount: 0,
          itemCount: 0,
          stockDetails: [],
          rawResponse: responseData,
        };
      }
    } catch (error) {
      console.error("❌ Stock consolidation API error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });

      return {
        status: false,
        error:
          error.response?.data?.message || error.message || "Network error",
        totalStock: 0,
        partCount: 0,
        itemCount: 0,
        stockDetails: [],
      };
    }
  },

  // Get Warehouse Occupancy
  getWarehouseOccupancy: async (orgId, branchCode, warehouse, client) => {
    try {
      console.log("🔍 API Call - Warehouse Occupancy:", {
        url: "/api/dashboardController/getBinDetailsForClientWise",
        params: { orgId, branchCode, warehouse, client },
      });

      const response = await apiClient.get(
        "/api/dashboardController/getBinDetailsForClientWise",
        {
          params: {
            orgId,
            branchCode,
            warehouse,
            client,
          },
        }
      );

      console.log("✅ Full API Response:", response);

      let responseData;

      if (response && response.statusFlag) {
        console.log("📍 Response is direct data object");
        responseData = response;
      } else if (response && response.data) {
        console.log("📍 Response has data property");
        responseData = response.data;
      } else {
        console.log("📍 Response structure unknown");
        responseData = response;
      }

      console.log("📊 Processed Response Data:", responseData);

      if (!responseData) {
        console.error("❌ No response data");
        return {
          status: false,
          binDetails: [],
          occupied: 0,
          available: 0,
          total: 0,
          error: "No response data",
        };
      }

      const isStatusOk =
        responseData.status === true || responseData.statusFlag === "Ok";

      if (isStatusOk) {
        let binDetails = [];

        if (responseData.paramObjectsMap?.binDetails) {
          binDetails = responseData.paramObjectsMap.binDetails;
          console.log("📍 Found data in paramObjectsMap.binDetails");
        } else if (responseData.binDetails) {
          binDetails = responseData.binDetails;
          console.log("📍 Found data in binDetails");
        }

        console.log("📦 Bin Details Count:", binDetails.length);

        if (binDetails.length > 0) {
          console.log("📦 Sample bin:", binDetails[0]);
        }

        const occupied = binDetails.filter(
          (bin) => bin?.binStatus === "Occupied"
        ).length;
        const available = binDetails.filter(
          (bin) => bin?.binStatus === "Empty"
        ).length;

        console.log("📈 Occupancy Stats:", {
          occupied,
          available,
          total: binDetails.length,
          percentage:
            binDetails.length > 0
              ? Math.round((occupied / binDetails.length) * 100)
              : 0,
        });

        return {
          status: true,
          binDetails,
          occupied,
          available,
          total: binDetails.length,
          rawResponse: responseData,
        };
      } else {
        console.error("❌ API returned error status");
        return {
          status: false,
          binDetails: [],
          occupied: 0,
          available: 0,
          total: 0,
          error: "API returned error status",
          rawResponse: responseData,
        };
      }
    } catch (error) {
      console.error("💥 API Error:", {
        message: error.message,
        code: error.code,
        response: error.response,
        config: error.config,
      });

      return {
        status: false,
        binDetails: [],
        occupied: 0,
        available: 0,
        total: 0,
        error: error.message || "Network error",
      };
    }
  },

  // Get GRN Data
  getGRNData: async (orgId, branchCode, client, finYear, warehouse, month,  type = "yesterday") => {
    try {
      console.log("🔍 API Call - GRN Data");

      const response = await apiClient.get(
        "/api/grn/getGrnStatusForDashBoard",
        {
          params: {
            orgId,
            branchCode,
            client,
            finYear,
            warehouse,
            type,
            // month,
          },
        }
      );

      let responseData = response?.statusFlag
        ? response
        : response?.data || response;

      if (responseData?.status === true) {
        const grnData = responseData.paramObjectsMap?.grnDashboard || [];
        const pending = grnData.filter((item) => item.status === "Pending");
        const completed = grnData.filter((item) => item.status === "Complete");

        console.log("✅ GRN Data:", {
          pending: pending.length,
          completed: completed.length,
        });

        return { pending, completed };
      }
      return { pending: [], completed: [] };
    } catch (error) {
      console.error("Error fetching GRN data:", error);
      return { pending: [], completed: [] };
    }
  },

  // Get Putaway Data
  getPutawayData: async (orgId, branchCode, client, finYear, month, type = "yesterday") => {
    try {
      const response = await apiClient.get(
        "/api/putaway/getPutawayForDashBoard",
        {
          params: {
            orgId,
            branchCode,
            client,
            finYear,
            type
            // month,
          },
        }
      );

      let responseData = response?.statusFlag
        ? response
        : response?.data || response;

      if (responseData?.status === true) {
        const putawayData =
          responseData.paramObjectsMap?.putawayDashboard || [];
        const pending = putawayData.filter((item) => item.status === "Pending");
        const completed = putawayData.filter(
          (item) => item.status === "Complete"
        );
        return { pending, completed };
      }
      return { pending: [], completed: [] };
    } catch (error) {
      console.error("Error fetching putaway data:", error);
      return { pending: [], completed: [] };
    }
  },

  // Get Buyer Order Data
  getBuyerOrderData: async (orgId, branchCode, client, finYear, warehouse, type = "yesterday") => {
    try {
      const response = await apiClient.get(
        "/api/buyerOrder/getBuyerorderDashboard",
        {
          params: {
            orgId,
            branchCode,
            client,
            finYear,
            warehouse,
            type
          },
        }
      );

      let responseData = response?.statusFlag
        ? response
        : response?.data || response;

      if (responseData?.status === true) {
        const buyerOrderData =
          responseData.paramObjectsMap?.buyerorderDashboard || [];
        const pending = buyerOrderData.filter(
          (item) => item.status === "Pending"
        );
        const completed = buyerOrderData.filter(
          (item) => item.status === "Complete"
        );
        return { pending, completed };
      }
      return { pending: [], completed: [] };
    } catch (error) {
      console.error("Error fetching buyer order data:", error);
      return { pending: [], completed: [] };
    }
  },

  // Get Pick Request Data
  getPickRequestData: async (orgId, branchCode, client, finYear, type = "yesterday") => {
    try {
      const response = await apiClient.get(
        "/api/pickrequest/getPicrequestDashboard",
        {
          params: {
            orgId,
            branchCode,
            client,
            finyear: finYear,
            type
          },
        }
      );

      let responseData = response?.statusFlag
        ? response
        : response?.data || response;

      if (responseData?.status === true) {
        const pickRequestData =
          responseData.paramObjectsMap?.picrequestDashboard || [];
        const pending = pickRequestData.filter(
          (item) => item.status === "Pending"
        );
        const completed = pickRequestData.filter(
          (item) => item.status === "Complete"
        );
        return { pending, completed };
      }
      return { pending: [], completed: [] };
    } catch (error) {
      console.error("Error fetching pick request data:", error);
      return { pending: [], completed: [] };
    }
  },

  // Get Storage Details
  getStorageDetails: async (orgId, branchCode, warehouse) => {
    try {
      const response = await apiClient.get(
        "/api/dashboardController/getStorageDetails",
        {
          params: {
            orgId,
            branchCode,
            warehouse,
          },
        }
      );

      let responseData = response?.statusFlag
        ? response
        : response?.data || response;

      if (responseData?.status === true || responseData?.statusFlag === "Ok") {
        return responseData.paramObjectsMap?.storageDetails || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching storage details:", error);
      return [];
    }
  },

  // Get Bin Details
  getBinDetails: async (orgId, branchCode, warehouse, client, bin) => {
    try {
      const response = await apiClient.get(
        "/api/dashboardController/getBinDetails",
        {
          params: {
            orgId,
            branchCode,
            warehouse,
            client,
            bin,
          },
        }
      );

      let responseData = response?.statusFlag
        ? response
        : response?.data || response;

      if (responseData?.status === true || responseData?.statusFlag === "Ok") {
        return responseData.paramObjectsMap?.binDetails || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching bin details:", error);
      return [];
    }
  },

  // Get Stock Summary
  getStockSummary: async (orgId, branchCode, client, warehouse) => {
    try {
      const response = await apiClient.get("/api/inventory/getStockSummary", {
        params: {
          orgId,
          branchCode,
          client,
          warehouse,
        },
      });

      let responseData = response?.statusFlag
        ? response
        : response?.data || response;

      if (responseData?.status === true) {
        const stockData = responseData.paramObjectsMap?.stockSummary || {};
        return {
          fastMoving: stockData.fastMoving || 0,
          slowMoving: stockData.slowMoving || 0,
          nearExpiry: stockData.nearExpiry || 0,
          damaged: stockData.damaged || 0,
          totalStock: stockData.totalStock || 0,
        };
      }
      return {
        fastMoving: 0,
        slowMoving: 0,
        nearExpiry: 0,
        damaged: 0,
        totalStock: 0,
      };
    } catch (error) {
      console.error("Error fetching stock summary:", error);
      return {
        fastMoving: 0,
        slowMoving: 0,
        nearExpiry: 0,
        damaged: 0,
        totalStock: 0,
      };
    }
  },

  // Test connection
  testConnection: async () => {
    try {
      const response = await apiClient.get("/");
      console.log("Connection test response:", response);
      return { success: true, data: response };
    } catch (error) {
      console.error("Connection test failed:", error);
      return { success: false, error: error.message };
    }
  },

  // In dashboardAPI.js
  getHoldMaterialCount: async (orgId, branchCode, warehouse, client) => {
    try {
      const response = await apiClient.get(
        "/api/dashboardController/getHoldMaterialCount",
        {
          params: {
            orgId,
            branchCode,
            warehouse,
            client,
          },
        }
      );

      // Check if response has data and extract properly
      if (response && response.paramObjectsMap) {
        return response.paramObjectsMap.holdMaterialCount || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching hold material count:", error);
      return [];
    }
  },

  getExpiryProducts: async (orgId, branchCode, warehouse, client) => {
    try {
      const response = await apiClient.get(
        "/api/dashboardController/getExpDetailsForMaterials",
        {
          params: {
            orgId,
            branchCode,
            warehouse,
            client,
          },
        }
      );

      // Check if response has data and extract properly
      if (response && response.paramObjectsMap) {
        return response.paramObjectsMap.expDetails || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching expiry products:", error);
      return [];
    }
  },

  getCriticalStockLevel: async (orgId, branchCode, warehouse, client) => {
    try {
      const response = await apiClient.get(
        "/api/dashboardController/getCriticalStockLevelDetails",
        {
          params: {
            orgId,
            branchCode,
            warehouse,
            client,
          },
        }
      );

      // Check if response has data and extract properly
      if (response && response.paramObjectsMap) {
        return response.paramObjectsMap.expDetails || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching Critical Stock Level products:", error);
      return [];
    }
  },
};

export default dashboardAPI;
