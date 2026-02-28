import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Loader,
  AlertCircle,
  MapPin,
  Clock,
  TrendingUp,
  Navigation,
} from "lucide-react";
import { getDeliveryRoute } from "../utils/locationService";
import {
  initializeSocket,
  joinOrderRoom,
  leaveOrderRoom,
  disconnectSocket,
  onRiderLocationUpdate,
  offRiderLocationUpdate,
} from "../utils/socketService";

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

const CustomerTrackingMap = ({ orderId, onClose }) => {
  // Refs for map and markers (persistent across renders)
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const mapInitializedRef = useRef(false);

  // State management
  const [riderLocation, setRiderLocation] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [remainingDuration, setRemainingDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  // ===================================================================
  // 1. FETCH DELIVERY ROUTE ON MOUNT
  // ===================================================================
  useEffect(() => {
    console.log("[CustomerTrackingMap] Mounted for orderId:", orderId);

    if (!mapboxgl.accessToken) {
      console.error("[CustomerTrackingMap] Mapbox access token missing");
      setError(
        "Mapbox access token is not configured. Please check your environment variables.",
      );
      setLoading(false);
      return;
    }

    // Fetch delivery route (Rider → Customer)
    const fetchRoute = async () => {
      try {
        console.log("[API] Fetching delivery route for orderId:", orderId);
        const response = await getDeliveryRoute(orderId);
        console.log("[API] Route response received:", response);

        if (response.status === "success") {
          const { distance, duration, geometry, destination, origin } =
            response;

          const distanceNum = parseFloat(distance);
          const durationNum = parseFloat(duration);

          console.log("[API] Route details:", {
            origin: origin.coordinates,
            destination: destination.coordinates,
            distance: `${distanceNum} km`,
            duration: `${durationNum} min`,
            geometryPoints: geometry?.coordinates?.length || 0,
          });

          setRouteData({
            geometry: geometry,
            distance: distanceNum,
            duration: durationNum,
            destination: destination.coordinates, // Customer location
            origin: origin.coordinates, // Rider current location
          });

          setRemainingDistance(distanceNum);
          setRemainingDuration(durationNum);

          console.log("[API] Route data set successfully (Rider → Customer)");
        } else {
          console.error("[API] Route response not successful:", response);
          setError("Unable to fetch route. Please check the order details.");
          setLoading(false);
        }
      } catch (err) {
        console.error("[API] Error fetching delivery route:", err);
        let errorMessage = "Failed to load delivery route";
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchRoute();

    // Cleanup function
    return () => {
      console.log("[CustomerTrackingMap] Unmounting");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // ===================================================================
  // 2. INITIALIZE MAP WHEN ROUTE DATA IS AVAILABLE
  // ===================================================================
  useEffect(() => {
    // Only initialize if we have route data and haven't initialized yet
    if (!routeData || mapInitializedRef.current) return;

    // Ensure container is ready
    if (!mapContainerRef.current) {
      console.warn("[Map] Container not ready yet");
      return;
    }

    console.log("[Map] Initializing customer tracking map");
    initializeMap();
    mapInitializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeData]);

  // ===================================================================
  // 3. SETUP SOCKET LISTENER FOR RIDER LOCATION UPDATES
  // ===================================================================
  useEffect(() => {
    // Only start tracking if map is initialized
    if (!mapRef.current || !routeData || !orderId) {
      console.log("[Socket] Waiting for map and route data");
      return;
    }

    console.log("[Socket] Setting up real-time tracking for order:", orderId);

    try {
      // Initialize socket connection
      initializeSocket();
      joinOrderRoom(orderId);

      // Listen for rider location updates
      const handleLocationUpdate = (data) => {
        console.log("[Socket] Rider location update:", {
          lat: data.latitude,
          lng: data.longitude,
          timestamp: data.timestamp,
        });

        if (data.latitude && data.longitude) {
          // Validate coordinates are valid numbers
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);

          if (isNaN(lat) || isNaN(lng)) {
            console.warn("[Update] Invalid coordinates received:", {
              lat,
              lng,
            });
            return;
          }

          console.log("[Update] Rider moved to:", { lat, lng });

          // Update marker position FIRST (before state update to prevent re-render issues)
          if (riderMarkerRef.current) {
            // Marker already exists, just update position
            riderMarkerRef.current.setLngLat([lng, lat]);
            console.log("[Update] Rider marker position updated");
          } else if (mapRef.current) {
            // First time seeing rider location, create marker
            const riderEl = createRiderMarkerElement();
            riderMarkerRef.current = new mapboxgl.Marker({
              element: riderEl,
              anchor: "center",
              offset: [0, 0],
            })
              .setLngLat([lng, lat])
              .addTo(mapRef.current);
            console.log("[Update] Rider marker created");
          }

          // Update state after marker position is set
          const newLocation = { lat, lng };
          setRiderLocation(newLocation);

          // Update distance and ETA based on straight-line distance
          if (routeData?.destination) {
            const [destLng, destLat] = routeData.destination;
            const straightLineDistance = calculateDistance(
              lat,
              lng,
              destLat,
              destLng,
            );

            // Display updated metrics
            setRemainingDistance(straightLineDistance);

            // Estimate duration (assuming average delivery speed of 30 km/h)
            const estimatedDuration = (straightLineDistance / 30) * 60; // minutes
            setRemainingDuration(estimatedDuration);

            console.log("[Update] Distance updated:", {
              distance: `${straightLineDistance.toFixed(2)} km`,
              eta: `${Math.ceil(estimatedDuration)} min`,
            });
          }
        }
      };

      onRiderLocationUpdate(handleLocationUpdate);

      setIsTracking(true);
      console.log("[Socket] Live tracking enabled");
    } catch (socketError) {
      console.error("[Socket] Connection error:", socketError);
    }

    // Cleanup: Remove socket listener when effect re-runs or component unmounts
    return () => {
      console.log("[Socket] Removing rider location listener");
      offRiderLocationUpdate();
      setIsTracking(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // ===================================================================
  // CLEANUP ON UNMOUNT ONLY
  // ===================================================================
  useEffect(() => {
    return () => {
      console.log("[CustomerTrackingMap] Component unmounting - cleaning up");

      // Remove markers
      if (riderMarkerRef.current) {
        riderMarkerRef.current.remove();
        riderMarkerRef.current = null;
      }
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.remove();
        destinationMarkerRef.current = null;
      }

      // Remove map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Disconnect socket
      leaveOrderRoom(orderId);
      disconnectSocket();
    };
  }, [orderId]); // Only orderId in dependency, runs cleanup only on unmount

  // ===================================================================
  // MARKER CREATION FUNCTIONS
  // ===================================================================

  // Create rider marker element (navigation-style blue marker with pulse)
  const createRiderMarkerElement = () => {
    const el = document.createElement("div");
    el.className = "rider-marker";
    el.style.width = "40px";
    el.style.height = "40px";
    el.style.position = "relative";
    el.style.display = "block";
    el.style.margin = "0";
    el.style.padding = "0";
    el.style.pointerEvents = "none"; // Prevent interference with map interactions

    // Outer pulse ring
    const pulseRing = document.createElement("div");
    pulseRing.style.position = "absolute";
    pulseRing.style.top = "0";
    pulseRing.style.left = "0";
    pulseRing.style.width = "40px";
    pulseRing.style.height = "40px";
    pulseRing.style.borderRadius = "50%";
    pulseRing.style.backgroundColor = "rgba(59, 130, 246, 0.3)";
    pulseRing.style.animation = "pulse 2s ease-out infinite";
    pulseRing.style.pointerEvents = "none";
    pulseRing.style.margin = "0";
    pulseRing.style.padding = "0";

    // Inner marker dot
    const markerDot = document.createElement("div");
    markerDot.style.position = "absolute";
    markerDot.style.top = "50%";
    markerDot.style.left = "50%";
    markerDot.style.transform = "translate(-50%, -50%)";
    markerDot.style.width = "20px";
    markerDot.style.height = "20px";
    markerDot.style.borderRadius = "50%";
    markerDot.style.backgroundColor = "#3b82f6";
    markerDot.style.border = "3px solid white";
    markerDot.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
    markerDot.style.pointerEvents = "none";
    markerDot.style.margin = "0";
    markerDot.style.padding = "0";

    el.appendChild(pulseRing);
    el.appendChild(markerDot);

    // Add CSS animation only once
    if (!document.getElementById("customer-rider-marker-animation")) {
      const style = document.createElement("style");
      style.id = "customer-rider-marker-animation";
      style.textContent = `
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return el;
  };

  // Create destination marker element (red location pin)
  const createDestinationMarkerElement = () => {
    const el = document.createElement("div");
    el.className = "customer-marker";
    el.style.width = "48px";
    el.style.height = "48px";
    el.style.position = "relative";
    el.style.cursor = "pointer";

    el.innerHTML = `
      <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
              fill="#EA4335" stroke="white" stroke-width="1"/>
        <circle cx="12" cy="9" r="3.5" fill="white"/>
        <circle cx="12" cy="9" r="2" fill="#EA4335"/>
      </svg>
    `;

    return el;
  };

  // ===================================================================
  // INITIALIZE MAPBOX MAP
  // ===================================================================
  const initializeMap = () => {
    if (!routeData || !routeData.destination) {
      console.error("[Map] Cannot initialize without route data");
      return;
    }

    console.log("[Map] Initializing with data:", {
      destination: routeData.destination,
      origin: routeData.origin,
      distance: routeData.distance,
      duration: routeData.duration,
    });

    try {
      // Center map on customer delivery location (destination)
      const [destLng, destLat] = routeData.destination;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [destLng, destLat], // Center on customer location
        zoom: 13,
        pitch: 0,
        bearing: 0,
      });

      mapRef.current = map;
      console.log("[Map] Instance created successfully");

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.on("load", () => {
        console.log("[Map] Loaded successfully");

        // Add customer destination marker (red pin)
        const destEl = createDestinationMarkerElement();
        destinationMarkerRef.current = new mapboxgl.Marker({
          element: destEl,
          anchor: "bottom",
        })
          .setLngLat([destLng, destLat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              '<div class="p-2"><p class="font-semibold">Your Delivery Location</p></div>',
            ),
          )
          .addTo(map);
        console.log("[Map] Customer destination marker added");

        // Add delivery route line (Rider → Customer)
        if (routeData.geometry) {
          addRouteToMap(routeData.geometry);
          console.log("[Map] Route line added (Rider → Customer)");
        }

        // Add rider marker at route start (aligned with route line like RiderMap)
        if (routeData.geometry?.coordinates?.length > 0) {
          // Use route geometry start point for perfect alignment with route line
          const [riderLng, riderLat] = routeData.geometry.coordinates[0];
          const riderEl = createRiderMarkerElement();
          riderMarkerRef.current = new mapboxgl.Marker({
            element: riderEl,
            anchor: "center",
            offset: [0, 0],
          })
            .setLngLat([riderLng, riderLat])
            .addTo(map);
          console.log("[Map] Rider marker added at route start:", {
            lat: riderLat,
            lng: riderLng,
          });

          // Set initial rider location state
          setRiderLocation({ lat: riderLat, lng: riderLng });
        }

        // Auto-zoom to show full route (Rider → Customer)
        fitMapToBounds();
        console.log("[Map] Auto-zoomed to route area");

        setLoading(false);
      });

      map.on("error", (e) => {
        console.error("Map error:", e);
        setError("Map failed to load. Please check your internet connection.");
      });
    } catch (mapError) {
      console.error("Error initializing map:", mapError);
      setError("Failed to initialize map. Please check your Mapbox token.");
      setLoading(false);
    }
  };

  // ===================================================================
  // ADD ROUTE LINE TO MAP (Rider → Customer)
  // This route is calculated by backend using Mapbox Directions API
  // ===================================================================
  const addRouteToMap = (geometry) => {
    const map = mapRef.current;
    if (!map) return;

    try {
      if (!map.isStyleLoaded()) {
        console.warn("[Route] Map style not loaded yet, waiting...");
        map.once("style.load", () => addRouteToMap(geometry));
        return;
      }

      console.log("[Route] Adding delivery route to map");

      // Remove existing route if any
      if (map.getSource("route")) {
        map.removeLayer("route");
        map.removeSource("route");
      }

      // Validate geometry
      if (
        !geometry ||
        !geometry.coordinates ||
        geometry.coordinates.length === 0
      ) {
        console.error("[Route] Invalid geometry data");
        return;
      }

      // Add route source (GeoJSON from backend)
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: geometry,
        },
      });

      // Add route layer (green line representing delivery path)
      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#10b981", // Green color for delivery route
          "line-width": 6,
          "line-opacity": 0.9,
        },
      });

      console.log(
        "[Route] Delivery route line added successfully (",
        geometry.coordinates.length,
        "points)",
      );
    } catch (error) {
      console.error("[Route] Error adding route to map:", error);
    }
  };

  // ===================================================================
  // FIT MAP TO SHOW FULL ROUTE
  // ===================================================================
  const fitMapToBounds = () => {
    if (!mapRef.current || !routeData) return;

    const bounds = new mapboxgl.LngLatBounds();

    // Add destination to bounds
    if (routeData.destination) {
      bounds.extend([routeData.destination[0], routeData.destination[1]]);
    }

    // Add origin to bounds
    if (routeData.origin) {
      bounds.extend([routeData.origin[0], routeData.origin[1]]);
    }

    // Add rider location if available
    if (riderLocation) {
      bounds.extend([riderLocation.lng, riderLocation.lat]);
    }

    mapRef.current.fitBounds(bounds, {
      padding: { top: 100, bottom: 100, left: 50, right: 50 },
      maxZoom: 15,
      duration: 1000,
    });

    console.log("Map fitted to bounds");
  };

  // ===================================================================
  // CALCULATE DISTANCE (Haversine formula)
  // ===================================================================
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ===================================================================
  // HANDLE BACKDROP CLICK
  // ===================================================================
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ===================================================================
  // HANDLE REFRESH
  // ===================================================================
  const handleRefresh = () => {
    console.log("[Refresh] Resetting map and fetching new route");

    setError(null);
    setLoading(true);
    mapInitializedRef.current = false;
    setRouteData(null);
    setRemainingDistance(0);
    setRemainingDuration(0);

    // Clear marker references
    if (riderMarkerRef.current) {
      riderMarkerRef.current.remove();
      riderMarkerRef.current = null;
    }
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }

    // Clear existing map if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Re-fetch route data
    const fetchRoute = async () => {
      try {
        console.log("[API] Fetching delivery route for orderId:", orderId);
        const response = await getDeliveryRoute(orderId);
        console.log("[API] Route response received:", response);

        if (response.status === "success") {
          const { distance, duration, geometry, destination, origin } =
            response;

          const distanceNum = parseFloat(distance);
          const durationNum = parseFloat(duration);

          setRouteData({
            geometry: geometry,
            distance: distanceNum,
            duration: durationNum,
            destination: destination.coordinates,
            origin: origin.coordinates,
          });

          setRemainingDistance(distanceNum);
          setRemainingDuration(durationNum);

          console.log("[API] Route data refreshed successfully");
        } else {
          console.error("[API] Route response not successful:", response);
          setError("Unable to fetch route. Please check the order details.");
          setLoading(false);
        }
      } catch (err) {
        console.error("[API] Error fetching delivery route:", err);
        let errorMessage = "Failed to load delivery route";
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchRoute();
  };

  // ===================================================================
  // RENDER: ERROR STATE MODAL (similar to RiderMap)
  // ===================================================================
  if (error) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
        onClick={handleBackdropClick}
      >
        <div
          className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Unable to Load Map
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onClose()}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleRefresh}
              className="flex-1 bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================================
  // RENDER: LOADING STATE (similar to RiderMap - full screen)
  // ===================================================================
  if (loading && !routeData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <Loader className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-blue-600 mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-800 text-base sm:text-lg font-semibold">
            Loading delivery route...
          </p>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">
            Fetching real-time tracking information
          </p>
        </div>
      </div>
    );
  }

  // ===================================================================
  // RENDER: MAIN MAP VIEW
  // ===================================================================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-6xl h-[95vh] sm:h-[90vh] bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-white border-b border-gray-200">
          <h1 className="text-base sm:text-xl font-bold text-gray-800">
            Track Your Delivery
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            {isTracking && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium hidden xs:inline">
                  Live Tracking
                </span>
                <span className="text-xs sm:text-sm font-medium xs:hidden">
                  Live
                </span>
              </div>
            )}
            <button
              onClick={() => onClose()}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition"
              title="Close"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative flex-1">
          <div ref={mapContainerRef} className="absolute inset-0" />

          {/* Map Controls */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 flex flex-col gap-2">
            {/* Recenter Button */}
            <button
              onClick={fitMapToBounds}
              className="bg-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition"
              title="Show full route"
            >
              <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Information Panel */}
        <div className="bg-white border-t border-gray-200 p-3 sm:p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Delivery Info Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-1.5 sm:p-2 rounded-full">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Your order is on the way
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">
                    Track your delivery in real-time
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center gap-1 self-start sm:self-auto"
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {/* Distance */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">
                      Remaining Distance
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-800">
                      {remainingDistance.toFixed(1)}
                      <span className="text-xs sm:text-sm font-normal text-gray-600 ml-1">
                        km
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Estimated Time */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-green-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">
                      Estimated Time
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-800">
                      {Math.ceil(remainingDuration)}
                      <span className="text-xs sm:text-sm font-normal text-gray-600 ml-1">
                        min
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CustomerTrackingMap.propTypes = {
  orderId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CustomerTrackingMap;
