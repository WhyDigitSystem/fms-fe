const SCREEN_CODE_MAPPING = {
    // Navigation items
    'DASHBOARD': 'DASHBOARD',
    'MASTERS': 'MASTERS',
    'INBOUND': 'INBOUND',
    'OUTBOUND': 'OUTBOUND',
    'VAS': 'VAS',
    'STOCK_PROCESS': 'STOCK_PROCESS',
    'REPORTS': 'REPORTS',
    'SETUP': 'SETUP',

    // Masters screens
    'ITEM': 'ITEM',
    'BUYER': 'BUYER',
    'CARRIER': 'CAR',
    'SUPPLIER': 'SUP',
    'UNIT': 'UNIT',
    'WAREHOUSE LOCATION': 'WHL',

    // Inbound screens
    'GATE PASS IN': 'GP',
    'GRN': 'GRN',
    'PUTAWAY': 'PC',

    // Outbound screens
    'BUYER ORDER': 'BO',
    'PICK REQUEST': 'PR',
    'MULTI BUYER ORDER': 'MBO',
    'MULTI PICK REQUEST': 'MPR',
    'REVERSE PICK': 'RP',
    'DELIVERY CHALLAN': 'DC',
    'SALES RETURN': 'SR',
    'SALES INVOICE': 'SI',

    // VAS screens
    'VAS PUTAWAY': 'VPUTAWAY',
    'VAS PICK': 'VPICK',
    'KITTING': 'KIT',
    'DEKITTING': 'DEKIT',

    // Stock Process screens
    'LOCATION MOVEMENT': 'LM',
    'STOCK RESTATE': 'STR',
    'CODE CONVERSION': 'CC',
    'CYCLE COUNT': 'CY',
    'OPENING STOCK': 'OS',

    // Report screens
    'STOCK CONSOLIDATION': 'STCON',
    'STOCK STOCK_CONSOLIDATION BINWISE': 'STCONBW',
    'STOCK LEDGER REPORT': 'STL',
    'STOCK BATCH WISE REPORT': 'STBATWR',
    'STOCK BIN BATCH WISE': 'STBBS',
    'BUYER FULLFILLMENT': 'BFF',

    // Setup screens
    'COUNTRY': 'COUNTRY',
    'STATE': 'STATE',
    'CITY': 'CITY',
    'CUSTOMER': 'CUSTOMER',
    'WAREHOUSE': 'WAREHOUSE',
    'LOCATION MAPPING': 'LOMAP',
    'CELL TYPE': 'CT',
    'EMPLOYEE': 'EMP',
    'USER CREATION': 'UC',
    'DOCUMENT_TYPE': 'DT',
    'DOCUMENT_TYPE_MAPPING': 'DTM',
    'FINANCIAL_YEAR': 'FY',
    'SCREENS': 'SCR',
    'SCREEN ACCESS': 'SA',
    'NEW ENTRIES': 'NEWE',
    'BRANCH': 'BR',
};

// Module to screen mapping for special handling
const MODULE_SCREENS = {
    'MASTERS': ['ITEM', 'BUYER', 'CAR', 'SUP', 'UNIT', 'WHL'],
    'INBOUND': ['GRN', 'PC', 'GP'],
    'OUTBOUND': ['BO', 'PR', 'MBO', 'MPR', 'RP', 'DC', 'SR', 'SI'],
    'VAS': ['VPUTAWAY', 'VPICK', 'KIT', 'DEKIT'],
    'STOCK_PROCESS': ['LM', 'STR', 'CC', 'CY', 'OS'],
    'REPORTS': ['STCON', 'STCONBW', 'STL', 'STBATWR', 'STBBS', 'BFF', ],
    'SETUP': ['COUNTRY', 'STATE', 'CITY', 'CUSTOMER', 'WAREHOUSE',
        'LOMAP', 'CT', 'EMP', 'UC', 'DT', 'DTM', 'FY', 'SCR', 'SA', 'NEWE', 'BR']
};

export const hasScreenAccess = (screenId) => {
    if (!screenId) return true;

    const userType = localStorage.getItem('userType')?.toUpperCase();

    if (userType === 'ADMIN') {
        return true;
    }

    try {
        const screenAccessStr = localStorage.getItem('screenAccess');

        if (!screenAccessStr) {
            return false;
        }

        const screenAccess = JSON.parse(screenAccessStr);

        if (Object.keys(screenAccess).length === 0) {
            return false;
        }

        if (MODULE_SCREENS[screenId]) {
            const hasAccess = MODULE_SCREENS[screenId].some(
                screenCode => screenAccess[screenCode]?.canRead === true
            );
            return hasAccess;
        }

        const actualScreenId = SCREEN_CODE_MAPPING[screenId] || screenId;
        const access = screenAccess[actualScreenId];

        const hasAccess = access?.canRead === true;
        return hasAccess;
    } catch (error) {
        return false;
    }
};