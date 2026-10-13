import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8085";
export const getAllActiveCountries = async (orgId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/commonmaster/country?orgid=${orgId}`
    );
    if (response.data.status === true) {
      const countryData = response.data.paramObjectsMap.countryVO
        .filter((row) => row.active === "Active")
        .map(({ id, countryName, countryCode }) => ({
          id,
          countryName,
          countryCode,
        }));

      return countryData;
    } else {
      console.error("API Error:", response);
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAllActiveStatesByCountry = async (country, orgId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/commonmaster/state/country?country=${country}&orgid=${orgId}`
    );
    if (response.data.status === true) {
      const countryData = response.data.paramObjectsMap.stateVO
        .filter((row) => row.active === "Active")
        .map(({ id, country, stateCode, stateName }) => ({
          id,
          country,
          stateCode,
          stateName,
        }));

      return countryData;
    } else {
      console.error("API Error:", response);
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAllActiveCitiesByState = async (state, orgId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/commonmaster/city/state?orgid=${orgId}&state=${state}`
    );
    if (response.data.status === true) {
      const cityData = response.data.paramObjectsMap.cityVO
        .filter((row) => row.active === "Active")
        .map(({ id, cityName, cityCode }) => ({ id, cityName, cityCode }));

      return cityData;
    } else {
      console.error("API Error:", response);
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAllActiveBranches = async (orgId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/warehousemastercontroller/branch?orgid=${orgId}`
    );
    if (response.data.status === true) {
      const branchData = response.data.paramObjectsMap.branchVO
        .filter((row) => row.active === "Active")
        .map(({ id, branch, branchCode }) => ({ id, branch, branchCode }));

      return branchData;
    } else {
      console.error("API Error:", response);
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAllActiveEmployees = async (orgId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/warehousemastercontroller/getAllEmployeeByOrgId?orgId=${orgId}`
    );
    if (response.data.status === true) {
      const empData = response.data.paramObjectsMap.employeeVO
        .filter((row) => row.active === "Active")
        .map(({ id, employeeName, employeeCode }) => ({
          id,
          employeeName,
          employeeCode,
        }));
      return empData;
    } else {
      console.error("API Error:");
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAllActiveUnits = async (orgId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/warehousemastercontroller/getAllUnitByOrgId?orgid=${orgId}`
    );
    if (response.data.status === true) {
      const unitData = response.data.paramObjectsMap.unitVO
        .filter((row) => row.active === "Active")
        .map(({ id, unitName, unitType }) => ({ id, unitName, unitType }));
      return unitData;
    } else {
      console.error("API Error:");
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAllActiveRegions = async (orgId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/commonmaster/getAllRegionsByOrgId?orgId=${orgId}`
    );
    if (response.data.status === true) {
      const empData = response.data.paramObjectsMap.regionVO
        .filter((row) => row.active === "Active")
        .map(({ id, regionName, regionCode }) => ({
          id,
          regionName,
          regionCode,
        }));
      return empData;
    } else {
      console.error("API Error:");
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAllActiveGroups = async (orgId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/warehousemastercontroller/group?orgid=${orgId}`
    );
    if (response.data.status === true) {
      const groupData = response.data.paramObjectsMap.groupVO
        .filter((row) => row.active === "Active")
        .map(({ id, groupName }) => ({ id, groupName }));
      return groupData;
    } else {
      console.error("API Error:");
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAllActiveLocationTypes = async (orgId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/warehousemastercontroller/locationType?orgid=${orgId}`
    );
    if (response.data.status === true) {
      const locationTypeData = response.data.paramObjectsMap.locationTypeVO
        .filter((row) => row.active === "Active")
        .map(({ id, binType, core }) => ({ id, binType, core }));
      return locationTypeData;
    } else {
      console.error("API Error:");
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAllActiveSupplier = async (cbranch, client, orgId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/warehousemastercontroller/supplier?cbranch=${cbranch}&client=${client}&orgid=${orgId}`
    );
    if (response.data.status === true) {
      const supplierData = response.data.paramObjectsMap.supplierVO
        .filter((row) => row.active === "Active")
        .map(({ id, supplierShortName, supplier }) => ({
          id,
          supplierShortName,
          supplier,
        }));

      return supplierData;
    } else {
      console.error("API Error:", response);
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAllActiveCarrier = async (
  cbranch,
  client,
  orgId,
  shipmentMode
) => {
  try {
    const response = await axios.get(
      `${API_URL}/api//warehousemastercontroller/getCarrierNameByCustomer?cbranch=${cbranch}&client=${client}&orgid=${orgId}&shipmentMode=${shipmentMode}`
    );
    if (response.data.status === true) {
      const carrierData = response.data.paramObjectsMap.CarrierVO.filter(
        (row) => row.active === "Active"
      ).map(({ id, carrier }) => ({
        id,
        carrier,
      }));

      return carrierData;
    } else {
      console.error("API Error:", response);
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};
export const getAllShipmentModes = async (orgId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/gatePassIn/getAllModeOfShipment?orgId=${orgId}`
    );
    if (response.data.status === true) {
      const modeOfShipmentData = response.data.paramObjectsMap.modOfShipments;

      return modeOfShipmentData;
    } else {
      console.error("API Error:", response);
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAllActivePartDetails = async (cBranch, client, orgId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/warehousemastercontroller/material?cbranch=${cBranch}&client=${client}&orgid=${orgId}`
    );
    console.log("API Response:", response);

    if (response.data.status === true) {
      const partData = response.data.paramObjectsMap.materialVO
        .filter((row) => row.active === "Active")
        .map(({ id, itemType, partno, partDesc, sku }) => ({
          id,
          itemType,
          partno,
          partDesc,
          sku,
        }));

      return partData;
    } else {
      console.error("API Error:", response);
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAllActiveBuyer = async (cBranch, client, orgId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/warehousemastercontroller/buyer?cbranch=${cBranch}&client=${client}&orgid=${orgId}`
    );
    console.log("API Response:", response);

    if (response.data.status === true) {
      const BuyerData = response.data.paramObjectsMap.buyerVO
        .filter((row) => row.active === "Active")
        .map(({ id, buyer, buyerShortName }) => ({
          id,
          buyer,
          buyerShortName,
        }));

      return BuyerData;
    } else {
      console.error("API Error:", response);
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAllActiveScreens = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/commonmaster/allScreenNames`
    );
    console.log("API Response:", response);

    if (response.data.status === true) {
      const screensData = response.data.paramObjectsMap.screenNamesVO
        .filter((row) => row.active === "Active")
        .map(({ id, screenCode, screenName }) => ({
          id,
          screenCode,
          screenName,
        }));

      return screensData;
    } else {
      console.error("API Error:", response);
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAllActiveCpartNo = async (cBranch, client, orgId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/warehousemastercontroller/material?cbranch=${cBranch}&client=${client}&orgid=${orgId}`
    );
    console.log("API Response:", response);

    if (response.data.status === true) {
      const cPartNoData = response.data.paramObjectsMap.materialVO
        .filter((row) => row.active === "Active")
        .map(({ id, partno, partDesc, sku }) => ({
          id,
          partno,
          partDesc,
          sku,
        }));

      return cPartNoData;
    } else {
      console.error("API Error:", response);
      return response;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const initCaps = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const generateGridData = (rows, levels, columns) => {
  const gridData = [];
  for (let r = 1; r <= rows; r++) {
    const rowPrefix = `R${String(r).padStart(2, "0")}`;
    const row = [];
    for (let l = 0; l < levels.length; l++) {
      for (let c = 1; c <= columns; c++) {
        const level = levels[l];
        const column = String(c).padStart(2, "0");
        const id = `${rowPrefix}-${level}${column}`;
        const partno = `P102-${Math.floor(Math.random() * 1000)}`;
        const partQty = Math.floor(Math.random() * 100) + 1; // Random quantity between 1 and 100
        row.push({
          id,
          percentage: Math.random() * 100,
          partno,
          partQty,
        });
      }
    }
    gridData.push(row);
  }
  return gridData;
};
