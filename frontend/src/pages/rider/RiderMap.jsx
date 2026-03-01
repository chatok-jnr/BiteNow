import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Navigation,
  MapPin,
  Clock,
  TrendingUp,
  Loader,
  AlertCircle,
} from "lucide-react";
import { getDeliveryRoute } from "../../utils/locationService";
import {
  initializeSocket,
  emitRiderLocation,
  joinOrderRoom,
  leaveOrderRoom,
  disconnectSocket,
} from "../../utils/socketService";

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

const RiderMap = ({ orderId, onClose }) => {
  // Refs for map and markers (persistent across renders)
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const locationUpdateIntervalRef = useRef(null);
  const mapInitializedRef = useRef(false);
  const lastRouteUpdateRef = useRef(null);
  const routeFetchTimeoutRef = useRef(null);

  // State management
  const [riderLocation, setRiderLocation] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [remainingDuration, setRemainingDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [riderHeading, setRiderHeading] = useState(0); // Track rider's direction
  const [isNavigating, setIsNavigating] = useState(false); // Track if in active navigation mode

  // ===================================================================
  // 1. GET INITIAL RIDER LOCATION (runs once on mount)
  // ===================================================================
  useEffect(() => {
    console.log("Component mounted, orderId:", orderId);

    if (!mapboxgl.accessToken) {
      setError(
        "Mapbox access token is not configured. Please check your environment variables.",
      );
      setLoading(false);
      return;
    }

    // Request initial location permission
    if (navigator.geolocation) {
      console.log("Requesting initial geolocation...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Initial location obtained:", latitude, longitude);
          setRiderLocation({ lat: latitude, lng: longitude });
          setLoading(false); // Allow map container to render
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError("Location access denied. Please enable location services.");
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  }, [orderId]);

  // ===================================================================
  // 2. INITIALIZE MAP ONLY ONCE (when location is available)
  // ===================================================================
  useEffect(() => {
    // Only initialize if we have location and haven't initialized yet
    if (!riderLocation || mapInitializedRef.current) return;

    // Ensure container is ready
    if (!mapContainerRef.current) {
      console.warn("Map container not ready yet");
      return;
    }

    console.log("Initializing map ONCE at:", riderLocation);
    initializeMap(riderLocation.lat, riderLocation.lng);
    mapInitializedRef.current = true;
  }, [riderLocation]);

  // ===================================================================
  // CLEANUP ON UNMOUNT ONLY
  // ===================================================================
  useEffect(() => {
    return () => {
      console.log("Component unmounting - cleaning up");

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

      // Clear intervals and timeouts
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
      }
      if (routeFetchTimeoutRef.current) {
        clearTimeout(routeFetchTimeoutRef.current);
      }

      // Disconnect socket
      leaveOrderRoom(orderId);
      disconnectSocket();
    };
  }, [orderId]); // Only orderId in dependency, runs cleanup only on unmount

  // ===================================================================
  // 3. START LIVE LOCATION TRACKING (after map is initialized)
  // ===================================================================
  useEffect(() => {
    // Only start tracking if map is initialized
    if (!mapRef.current || !riderLocation) return;

    console.log("Starting live location tracking (every 5 seconds)");
    setIsTracking(true);

    // Update location every 5 seconds
    locationUpdateIntervalRef.current = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, heading } = position.coords;
            // heading is the direction of travel in degrees (0-360)
            // 0/360 = North, 90 = East, 180 = South, 270 = West
            updateRiderLocation(latitude, longitude, heading);
          },
          (error) => {
            console.error("Location update error:", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          },
        );
      }
    }, 5000); // Update every 5 seconds as required

    return () => {
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
      }
      setIsTracking(false);
    };
  }, [mapRef.current, riderLocation]);

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

    // Outer pulse ring
    const pulseRing = document.createElement("div");
    pulseRing.style.position = "absolute";
    pulseRing.style.top = "0";
    pulseRing.style.left = "0";
    pulseRing.style.width = "100%";
    pulseRing.style.height = "100%";
    pulseRing.style.borderRadius = "50%";
    pulseRing.style.backgroundColor = "rgba(59, 130, 246, 0.3)";
    pulseRing.style.animation = "pulse 2s ease-out infinite";

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

    el.appendChild(pulseRing);
    el.appendChild(markerDot);

    // Add CSS animation
    const style = document.createElement("style");
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

    return el;
  };

  // Create destination marker element (red location pin like Google Maps)
  const createDestinationMarkerElement = () => {
    const el = document.createElement("div");
    el.className = "customer-marker";
    el.style.width = "48px";
    el.style.height = "48px";
    el.style.position = "relative";
    el.style.cursor = "pointer";

    // SVG for location pin
    el.innerHTML = `
      <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));">
        <!-- Pin shape -->
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
              fill="#EA4335" stroke="white" stroke-width="1"/>
        <!-- White center circle -->
        <circle cx="12" cy="9" r="3.5" fill="white"/>
        <!-- Inner red dot -->
        <circle cx="12" cy="9" r="2" fill="#EA4335"/>
      </svg>
    `;

    return el;
  };

  // ===================================================================
  // INITIALIZE MAPBOX MAP (called only once)
  // ===================================================================
  const initializeMap = (lat, lng) => {
    console.log("Initializing map at coordinates:", lat, lng);

    if (!mapContainerRef.current) {
      console.error("Map container ref is not available");
      setError("Unable to initialize map. Please refresh the page.");
      setLoading(false);
      return;
    }

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [lng, lat],
        zoom: 14,
        pitch: 0, // Start with flat view for overview
        bearing: 0,
      });

      mapRef.current = map;

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add geolocate control
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      });
      map.addControl(geolocate, "top-right");

      map.on("load", () => {
        console.log("Map loaded successfully");

        // Add rider marker (navigation style)
        const riderEl = createRiderMarkerElement();
        riderMarkerRef.current = new mapboxgl.Marker({
          element: riderEl,
          anchor: "center",
        })
          .setLngLat([lng, lat])
          .addTo(map);

        // Initialize Socket.IO
        try {
          initializeSocket(localStorage.getItem("token") || "");
          joinOrderRoom(orderId);
        } catch (socketError) {
          console.error("Socket initialization error:", socketError);
        }

        // Fetch delivery route from backend
        fetchDeliveryRoute();
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
  // FETCH AND DISPLAY DELIVERY ROUTE FROM BACKEND
  // ===================================================================
  const fetchDeliveryRoute = async () => {
    try {
      console.log("Fetching delivery route for orderId:", orderId);
      const response = await getDeliveryRoute(orderId);
      console.log("Route response:", response);

      if (response.status === "success") {
        const { distance, duration, geometry, destination, origin } = response;

        console.log("Route origin type:", origin?.type);
        console.log("Route origin coordinates:", origin?.coordinates);
        console.log("Route destination:", destination?.coordinates);
        console.log("Route geometry type:", geometry?.type);
        console.log(
          "Route geometry points:",
          geometry?.coordinates?.length || 0,
        );

        // Parse distance and duration to numbers
        const distanceNum = parseFloat(distance);
        const durationNum = parseFloat(duration);

        setRouteData({
          geometry: geometry,
          distance: distanceNum,
          duration: durationNum,
          destination: destination.coordinates,
        });

        // Use the backend-calculated distance and duration (follows roads)
        setRemainingDistance(distanceNum);
        setRemainingDuration(durationNum);

        console.log(
          "Set remaining metrics from backend:",
          distanceNum,
          "km,",
          durationNum,
          "min",
        );

        // Store current location as last route update point
        if (riderLocation) {
          lastRouteUpdateRef.current = {
            lat: riderLocation.lat,
            lng: riderLocation.lng,
          };
        }

        // Add route to map
        if (mapRef.current && geometry) {
          if (mapRef.current.isStyleLoaded()) {
            addRouteToMap(geometry);
          } else {
            console.log("Waiting for map style to load before adding route...");
            mapRef.current.once("style.load", () => {
              console.log("Map style loaded, adding route");
              addRouteToMap(geometry);
            });
          }
        }

        // Add destination marker
        if (destination?.coordinates && mapRef.current) {
          const [lng, lat] = destination.coordinates;

          // Remove existing destination marker if any
          if (destinationMarkerRef.current) {
            destinationMarkerRef.current.remove();
            destinationMarkerRef.current = null;
          }

          const destEl = createDestinationMarkerElement();
          destinationMarkerRef.current = new mapboxgl.Marker({
            element: destEl,
            anchor: "bottom",
          })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);

          // Auto-zoom to fit route area (only on initial load)
          if (!isNavigating) {
            fitMapToBounds();
          }
        }

        setLoading(false);
      } else {
        console.error("Route response not successful:", response);
        setError("Unable to fetch route. Please check the order details.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching delivery route:", err);
      console.error("Error response data:", err.response?.data);

      let errorMessage = "Failed to load delivery route";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      if (err.response?.data?.debug) {
        console.error("Debug info:", err.response.data.debug);
        errorMessage +=
          "\n\nPlease ensure the order has customer and restaurant locations set.";
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  // ===================================================================
  // ADD ROUTE LINE TO MAP
  // ===================================================================
  const addRouteToMap = (geometry) => {
    const map = mapRef.current;
    if (!map) return;

    try {
      if (!map.isStyleLoaded()) {
        console.warn("Map style not loaded yet, waiting...");
        map.once("style.load", () => {
          addRouteToMap(geometry);
        });
        return;
      }

      console.log("Adding route to map with geometry:", geometry);

      // Remove existing route if any
      if (map.getSource("route")) {
        console.log("Removing existing route layer and source");
        map.removeLayer("route");
        map.removeSource("route");
      }

      // Validate geometry
      if (
        !geometry ||
        !geometry.coordinates ||
        geometry.coordinates.length === 0
      ) {
        console.error("Invalid route geometry:", geometry);
        return;
      }

      // Add new route source and layer
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: geometry,
        },
      });

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#10b981",
          "line-width": 6,
          "line-opacity": 0.9,
        },
      });

      console.log(
        "Route added to map successfully with",
        geometry.coordinates.length,
        "points",
      );
    } catch (error) {
      console.error("Error adding route to map:", error);
    }
  };

  // ===================================================================
  // AUTO-ZOOM TO FIT ROUTE AREA (rider + destination)
  // ===================================================================
  const fitMapToBounds = () => {
    if (!mapRef.current || !riderLocation || !routeData?.destination) return;

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([riderLocation.lng, riderLocation.lat]);
    bounds.extend([routeData.destination[0], routeData.destination[1]]);

    mapRef.current.fitBounds(bounds, {
      padding: { top: 100, bottom: 100, left: 50, right: 50 },
      maxZoom: 15,
      duration: 1000,
      pitch: 0, // Reset pitch for overview
      bearing: 0, // Reset bearing for overview
    });

    console.log("Map zoomed to fit route area (overview mode)");
  };

  // ===================================================================
  // UPDATE RIDER LOCATION (called every 5 seconds)
  // ===================================================================
  const updateRiderLocation = (lat, lng, heading = null) => {
    console.log("Updating rider location:", lat, lng, "heading:", heading);
    const newLocation = { lat, lng };
    setRiderLocation(newLocation);

    // Update heading if available
    if (heading !== null && !isNaN(heading)) {
      setRiderHeading(heading);
    }

    // IMPORTANT: Only move the marker, do NOT reload map
    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLngLat([lng, lat]);
    }

    // In active navigation mode, adjust camera to follow rider with bearing
    if (mapRef.current && isNavigating && routeData) {
      const map = mapRef.current;

      // Smooth camera transition following the rider
      // Position rider slightly below center to show more road ahead
      map.easeTo({
        center: [lng, lat],
        bearing:
          heading !== null && !isNaN(heading) ? heading : map.getBearing(),
        pitch: 60, // Tilt angle for driving mode
        zoom: 16.5,
        duration: 1000,
        essential: true,
        offset: [0, 100], // Offset rider position to show more road ahead
      });
    }

    // Emit location to Socket.IO for real-time tracking
    emitRiderLocation(lat, lng);

    // Check if rider has moved significantly (>50 meters) to refetch route
    if (lastRouteUpdateRef.current) {
      const distance = calculateDistance(
        lastRouteUpdateRef.current.lat,
        lastRouteUpdateRef.current.lng,
        lat,
        lng,
      );

      // If moved more than 50 meters, refetch route after 2 seconds (debounce)
      if (distance > 0.05) {
        // 0.05 km = 50 meters
        console.log(
          `Rider moved ${(distance * 1000).toFixed(0)}m, scheduling route update`,
        );

        // Clear previous timeout
        if (routeFetchTimeoutRef.current) {
          clearTimeout(routeFetchTimeoutRef.current);
        }

        // Debounce route fetch by 2 seconds
        routeFetchTimeoutRef.current = setTimeout(() => {
          console.log("Refetching route with updated rider location");
          fetchDeliveryRoute();
          lastRouteUpdateRef.current = { lat, lng };
        }, 2000);
      }
    }

    // Don't recalculate metrics here - they'll be updated when route is refetched
    // The backend provides accurate road-distance calculations
  };

  // ===================================================================
  // CALCULATE DISTANCE BETWEEN TWO POINTS (Haversine formula)
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
  // CALCULATE REMAINING DISTANCE AND DURATION
  // ===================================================================
  // NOTE: This function is no longer used as we rely on backend route calculations
  // which follow actual roads. Straight-line distance calculation is inaccurate.
  // The backend automatically recalculates the route when the rider moves significantly.

  // ===================================================================
  // HANDLE BACKDROP CLICK TO CLOSE MODAL
  // ===================================================================
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ===================================================================
  // HANDLE REFRESH/RETRY
  // ===================================================================
  const handleRefresh = () => {
    setError(null);
    setLoading(true);
    mapInitializedRef.current = false;
    lastRouteUpdateRef.current = null;
    setIsNavigating(false);

    // Clear route data
    setRouteData(null);
    setRemainingDistance(0);
    setRemainingDuration(0);
    setRiderHeading(0);

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

    // Clear timeouts
    if (routeFetchTimeoutRef.current) {
      clearTimeout(routeFetchTimeoutRef.current);
    }

    // Request location permission again
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Location obtained after refresh:", latitude, longitude);
          setRiderLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Geolocation error after refresh:", error);
          setError("Location access denied. Please enable location services.");
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  // ===================================================================
  // RENDER: LOADING STATE
  // ===================================================================
  if (loading || !riderLocation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-800 text-lg font-semibold">
            Loading delivery route...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Please ensure location services are enabled
          </p>
        </div>
      </div>
    );
  }

  // ===================================================================
  // RENDER: ERROR STATE
  // ===================================================================
  if (error) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Unable to Load Map
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => onClose()}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleRefresh}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
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
  // RENDER: MAIN MAP VIEW
  // ===================================================================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-6xl h-full sm:h-[90vh] sm:mx-4 bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 sm:p-4 bg-white border-b border-gray-200">
          <h1 className="text-base sm:text-xl font-bold text-gray-800">
            Delivery Address
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            {isTracking && (
              <div className="flex items-center gap-1 sm:gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium">Live</span>
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
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {/* Toggle Navigation/Overview Mode */}
            <button
              onClick={() => {
                if (isNavigating) {
                  // Switch to overview mode
                  setIsNavigating(false);
                  fitMapToBounds();
                } else {
                  // Switch to navigation mode
                  setIsNavigating(true);
                  if (riderLocation && mapRef.current) {
                    mapRef.current.easeTo({
                      center: [riderLocation.lng, riderLocation.lat],
                      bearing: riderHeading,
                      pitch: 60,
                      zoom: 16.5,
                      duration: 1000,
                      essential: true,
                      offset: [0, 100],
                    });
                  }
                }
              }}
              className="bg-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition text-sm font-medium"
              title={
                isNavigating
                  ? "Show full route overview"
                  : "Start navigation mode"
              }
            >
              {isNavigating ? (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Overview
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Navigate
                </span>
              )}
            </button>

            {/* Recenter Button */}
            <button
              onClick={() => {
                if (riderLocation && mapRef.current) {
                  if (isNavigating) {
                    // In navigation mode: rotate to follow rider
                    mapRef.current.easeTo({
                      center: [riderLocation.lng, riderLocation.lat],
                      bearing: riderHeading,
                      pitch: 60,
                      zoom: 16.5,
                      duration: 1000,
                      essential: true,
                      offset: [0, 100],
                    });
                  } else {
                    // In overview mode: just center without rotation
                    mapRef.current.flyTo({
                      center: [riderLocation.lng, riderLocation.lat],
                      zoom: 15,
                      essential: true,
                    });
                  }
                }
              }}
              className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition"
              title="Center on my location"
            >
              <Navigation className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Information Panel */}
        <div className="bg-white border-t border-gray-200 px-3 py-3 sm:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Delivery Info Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-1.5 sm:p-2 rounded-full">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Delivering to</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">
                    Delivery Address
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {isNavigating && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      Navigation Mode
                    </span>
                  </div>
                )}
                <button
                  onClick={fetchDeliveryRoute}
                  className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center gap-1"
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
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {/* Distance */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-2.5 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div min-w-0>
                    <p className="text-xs text-gray-600 mb-0.5">Distance</p>
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
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-2.5 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-green-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Est. Time</p>
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

export default RiderMap;
