import {
  Autocomplete,
  DirectionsRenderer,
  GoogleMap,
  LoadScript,
  TrafficLayer,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import InputField from "../UI/InputField";
import CommonTable from "../common/CommonTable";

// Replace with valid key and ensure Google Routes API + Places + Traffic enabled
const MAPS_API_KEY = "AIzaSyDpZlwlIVN_z5uJwMey404fA19Qn3c8fyI";

// Mock endpoints
const fetchFuelPrice = async () => {
  // Mock: call your backend/API to get current fuel rate
  return 95.0; // e.g. ₹/L
};
const saveRouteApi = async (payload) => {
  // Mock: post to your backend
  console.log("Saving route to backend:", payload);
  return { success: true, id: Math.random().toString(36).substr(2, 9) };
};
const loadRoutesApi = async () => {
  // Mock: fetch list of saved routes
  return [
    {
      id: "route1",
      name: "Bangalore → Mysuru",
      payload: {
        /* ... */
      },
    },
    // ...
  ];
};

export default function RouteMaster() {
  const [form, setForm] = useState({
    status: "Active",
    origin: "",
    destination: "",
    vehicleType: "",
    mileage: "",
    fuelRate: "", // updated from real time
    kmPerLitre: "",
    showPumps: false,
    tatHours: "",
    routeDescription: "",
  });

  const [waypoints, setWaypoints] = useState([]); // intermediate stops
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [map, setMap] = useState(null);
  const originRef = useRef(null);
  const destinationRef = useRef(null);

  const [pitstops, setPitstops] = useState([]);
  const [routeCalcs, setRouteCalcs] = useState([]);
  const [pumps, setPumps] = useState([]);

  const [savedRoutes, setSavedRoutes] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    // On mount, fetch real fuel rate & saved routes
    (async () => {
      const rate = await fetchFuelPrice();
      setForm((f) => ({ ...f, fuelRate: rate }));
      setLoadingSaved(true);
      const list = await loadRoutesApi();
      setSavedRoutes(list);
      setLoadingSaved(false);
    })();
  }, []);

  const onFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const calcRoute = async () => {
    if (!originRef.current?.value || !destinationRef.current?.value) {
      alert("Please enter both Origin and Destination!");
      return;
    }

    const origin = originRef.current.value;
    const destination = destinationRef.current.value;

    try {
      const directionsService = new window.google.maps.DirectionsService();
      const wp = waypoints.map((wp) => ({
        location: wp.location,
        stopover: true,
      }));
      const result = await directionsService.route({
        origin,
        destination,
        waypoints: wp,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      setDirections(result);

      const route = result.routes[0].legs.reduce(
        (acc, leg) => {
          acc.distance += leg.distance.value;
          acc.duration += leg.duration.value;
          return acc;
        },
        { distance: 0, duration: 0 }
      );

      const distanceKm = (route.distance / 1000).toFixed(2);
      const durationHrs = (route.duration / 3600).toFixed(2);

      const kmPerL = parseFloat(form.kmPerLitre) || 0;
      const fuelCost = kmPerL
        ? ((distanceKm / kmPerL) * (parseFloat(form.fuelRate) || 0)).toFixed(2)
        : 0;

      setRouteInfo({
        origin,
        destination,
        waypoints: waypoints.map((w) => w.location),
        distanceKm,
        durationHrs,
        fuelCost,
        tollCost: null, // you could call Google Routes API for tolls :contentReference[oaicite:2]{index=2}
      });

      setForm((prev) => ({
        ...prev,
        origin,
        destination,
        mileage: `${distanceKm} km`,
        tatHours: `${durationHrs} hrs`,
      }));
    } catch (err) {
      console.error("Error fetching directions:", err);
      alert("Failed to calculate route. Check console for details.");
    }
  };

  const saveAll = async () => {
    const payload = {
      ...form,
      waypoints,
      pitstops,
      routeCalcs,
      pumps,
      routeInfo,
    };
    const res = await saveRouteApi(payload);
    if (res.success) {
      alert("Saved route with id: " + res.id);
      // optionally reload routes list
      setSavedRoutes((prev) => [
        ...prev,
        { id: res.id, name: form.origin + " → " + form.destination, payload },
      ]);
    } else {
      alert("Failed to save route");
    }
  };

  // Waypoint table
  const waypointCols = [
    {
      key: "location",
      header: "Waypoint Location",
      type: "text",
      placeholder: "Enter stop location",
      grow: true,
    },
    {
      key: "arrivalTime",
      header: "Arrival Time",
      type: "text",
      placeholder: "HH:MM",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto mt-5 p-6 bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Route Master
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {savedRoutes.length} saved routes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => {
              // clear everything
              setForm({
                status: "Active",
                origin: "",
                destination: "",
                vehicleType: "",
                mileage: "",
                fuelRate: form.fuelRate,
                kmPerLitre: "",
                showPumps: false,
                tatHours: "",
                routeDescription: "",
              });
              setWaypoints([]);
              setPitstops([]);
              setRouteCalcs([]);
              setPumps([]);
              setDirections(null);
              setRouteInfo(null);
            }}
          >
            Clear Form
          </button>
          <button
            onClick={saveAll}
            className="px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={onFormChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Routes + Map */}
      <LoadScript googleMapsApiKey={MAPS_API_KEY} libraries={["places"]}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Routes
            </h2>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Origin
              </label>
              <Autocomplete>
                <input
                  type="text"
                  ref={originRef}
                  placeholder="Enter Origin"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </Autocomplete>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Destination
              </label>
              <Autocomplete>
                <input
                  type="text"
                  ref={destinationRef}
                  placeholder="Enter Destination"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </Autocomplete>
            </div>

            <InputField
              label="Vehicle Type"
              name="vehicleType"
              value={form.vehicleType}
              onChange={onFormChange}
              compact
            />
            <InputField
              label="Fuel Rate (₹/L)"
              name="fuelRate"
              value={form.fuelRate}
              onChange={onFormChange}
              compact
            />
            <InputField
              label="Km/Litre"
              name="kmPerLitre"
              value={form.kmPerLitre}
              onChange={onFormChange}
              compact
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="showPumps"
                checked={form.showPumps}
                onChange={onFormChange}
                className="h-4 w-4 accent-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show Pumps
              </span>
            </div>

            <button
              onClick={calcRoute}
              className="mt-2 px-3 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Calculate Route on Map
            </button>

            {/* Waypoints Table */}
            <CommonTable
              title="Waypoints (Stops)"
              columns={waypointCols}
              rows={waypoints}
              onRowsChange={setWaypoints}
              className="mt-4"
            />
          </div>

          <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {routeInfo && (
              <div className="absolute top-3 left-3 z-10 bg-white/90 dark:bg-gray-800/80 backdrop-blur-md shadow-md rounded-lg px-4 py-2 text-sm">
                <div className="text-gray-800 dark:text-gray-100 font-medium mb-1">
                  {routeInfo.origin} → {routeInfo.destination}
                </div>
                <div className="flex flex-wrap gap-4 text-gray-700 dark:text-gray-300 text-xs">
                  <span>🛣️ {routeInfo.distanceKm} km</span>
                  <span>⏱️ {routeInfo.durationHrs} hrs</span>
                  <span>⛽ ₹{routeInfo.fuelCost} est.</span>
                  {routeInfo.tollCost != null && (
                    <span>💳 ₹{routeInfo.tollCost} toll</span>
                  )}
                </div>
              </div>
            )}

            <GoogleMap
              mapContainerStyle={{ width: "100%", height: 360 }}
              center={{ lat: 20.5937, lng: 78.9629 }}
              zoom={5}
              onLoad={(m) => setMap(m)}
            >
              <TrafficLayer />
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </div>
        </div>
      </LoadScript>

      {/* Editable Tables */}
      <CommonTable
        title="Pitstop Table"
        columns={[
          {
            key: "name",
            header: "Pitstop Name",
            type: "text",
            placeholder: "Enter pitstop",
          },
          {
            key: "distanceKm",
            header: "Distance (km)",
            type: "number",
            width: 120,
          },
          { key: "timeHrs", header: "Time (hrs)", type: "number", width: 120 },
        ]}
        rows={pitstops}
        onRowsChange={setPitstops}
        className="mb-8"
      />

      <CommonTable
        title="Calculations"
        columns={[
          {
            key: "name",
            header: "Name",
            type: "text",
            placeholder: "Enter name",
          },
          {
            key: "distance",
            header: "Distance (km)",
            type: "number",
            width: 120,
          },
          { key: "tollCost", header: "Toll Cost", type: "number", width: 120 },
          { key: "fuelCost", header: "Fuel Cost", type: "number", width: 120 },
          {
            key: "totalCost",
            header: "Total Cost",
            type: "number",
            width: 120,
          },
          {
            key: "duration",
            header: "Duration (hrs)",
            type: "number",
            width: 140,
          },
          { key: "isDefault", header: "Default", type: "checkbox", width: 90 },
        ]}
        rows={routeCalcs}
        onRowsChange={setRouteCalcs}
        className="mb-8"
      />

      <CommonTable
        title="Petrol Pumps Table"
        columns={[
          { key: "name", header: "Pump Name", type: "text" },
          { key: "address", header: "Address", type: "text" },
          { key: "city", header: "City", type: "text", width: 140 },
          { key: "state", header: "State", type: "text", width: 140 },
          {
            key: "type",
            header: "Type",
            type: "select",
            width: 140,
            options: [
              { label: "Company Owned", value: "Company Owned" },
              { label: "Dealer", value: "Dealer" },
            ],
          },
        ]}
        rows={pumps}
        onRowsChange={setPumps}
        className="mb-8"
      />

      {/* Description + TAT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Route Description
          </label>
          <textarea
            name="routeDescription"
            value={form.routeDescription}
            onChange={onFormChange}
            rows={4}
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the route..."
          />
        </div>
        <InputField
          label="TAT (in Hours)"
          name="tatHours"
          value={form.tatHours}
          onChange={onFormChange}
          compact
        />
      </div>
    </div>
  );
}
