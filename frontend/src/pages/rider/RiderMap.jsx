import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Navigation,
  MapPin,
  Clock,
  TrendingUp,
  ArrowLeft,
  Loader,
  AlertCircle,
  CheckCircle,
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

const RiderMap = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  const locationUpdateIntervalRef = useRef(null);

  // State management
  const [riderLocation, setRiderLocation] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [remainingDuration, setRemainingDuration] = useState(0);
  const [deliveryStatus, setDeliveryStatus] = useState("Going to Restaurant");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationPermission, setLocationPermission] = useState("prompt");
  const [isTracking, setIsTracking] = useState(false);

  // Get rider location
  useEffect(() => {
    console.log("Component mounted, orderId:", orderId);

    if (!mapboxgl.accessToken) {
      setError(
        "Mapbox access token is not configured. Please check your environment variables.",
      );
      setLoading(false);
      return;
    }

    // Request location permission
    if (navigator.geolocation) {
      console.log("Requesting geolocation...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Location obtained:", latitude, longitude);
          setRiderLocation({ lat: latitude, lng: longitude });
          setLocationPermission("granted");
          setLoading(false); // Location obtained, show map container
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError("Location access denied. Please enable location services.");
          setLocationPermission("denied");
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

  // Initialize map when location is available AND loading is false (map div is rendered)
  useEffect(() => {
    // Wait for loading to be false so the map div is actually rendered
    if (loading) return;

    if (!riderLocation || mapRef.current) return;

    // Ensure the container is ready
    if (!mapContainerRef.current) {
      console.warn("Map container not ready yet, retrying in 100ms...");
      // Retry after DOM renders
      const retryTimer = setTimeout(() => {
        if (mapContainerRef.current && !mapRef.current && riderLocation) {
          console.log("Retrying map initialization...");
          initializeMap(riderLocation.lat, riderLocation.lng);
        }
      }, 100);
      return () => clearTimeout(retryTimer);
    }

    console.log("Map container ready, initializing map...");
    initializeMap(riderLocation.lat, riderLocation.lng);

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
      }
      leaveOrderRoom(orderId);
      disconnectSocket();
    };
  }, [riderLocation, loading]); // Re-run when loading changes

  // Initialize Mapbox map
  const initializeMap = (lat, lng) => {
    console.log("Initializing map at coordinates:", lat, lng);

    // Safety check for container
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
        pitch: 45,
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

        // Add rider marker
        const el = createRiderMarkerElement();
        riderMarkerRef.current = new mapboxgl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat([lng, lat])
          .addTo(map);

        // Fetch delivery route
        fetchDeliveryRoute();

        // Initialize Socket.IO
        try {
          initializeSocket(localStorage.getItem("token") || "");
          joinOrderRoom(orderId);
        } catch (socketError) {
          console.error("Socket initialization error:", socketError);
        }

        // Start location tracking
        startLocationTracking();
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
  // Fetch delivery route from backend
  const fetchDeliveryRoute = async () => {
    try {
      console.log("Fetching delivery route for orderId:", orderId);
      const response = await getDeliveryRoute(orderId);
      console.log("Route response:", response);

      if (response.status === "success") {
        const { distance, duration, geometry, destination } = response;

        setRouteData({
          geometry: geometry,
          distance: distance,
          duration: duration,
          destination: destination.coordinates,
        });

        setRemainingDistance(distance);
        setRemainingDuration(duration);

        // Add route to map
        if (mapRef.current && geometry) {
          addRouteToMap(geometry);
        }

        // Add destination marker
        if (destination?.coordinates) {
          const [lng, lat] = destination.coordinates;
          const el = createDestinationMarkerElement();
          destinationMarkerRef.current = new mapboxgl.Marker({
            element: el,
            anchor: "center",
          })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);

          // Fit map to show both markers
          fitMapToBounds();
        }

        setLoading(false);
      } else {
        console.error("Route response not successful:", response);
        setError("Unable to fetch route. Please check the order details.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching delivery route:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load delivery route";
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Add route line to map
  const addRouteToMap = (geometry) => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing route if any
    if (map.getSource("route")) {
      map.removeLayer("route");
      map.removeSource("route");
    }

    // Add new route
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
        "line-color": "#3b82f6",
        "line-width": 5,
        "line-opacity": 0.8,
      },
    });
  };

  // Fit map to show rider and destination
  const fitMapToBounds = () => {
    if (!mapRef.current || !riderLocation || !routeData?.destination) return;

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([riderLocation.lng, riderLocation.lat]);
    bounds.extend([routeData.destination[0], routeData.destination[1]]);

    mapRef.current.fitBounds(bounds, {
      padding: { top: 100, bottom: 100, left: 50, right: 50 },
      maxZoom: 15,
    });
  };

  // Start continuous location tracking
  const startLocationTracking = () => {
    setIsTracking(true);

    // Watch position changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateRiderLocation(latitude, longitude);
      },
      (error) => {
        console.error("Location tracking error:", error);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );

    // Also poll location every 3 seconds as backup
    locationUpdateIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateRiderLocation(latitude, longitude);
        },
        (error) => {
          console.error("Location update error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 3000,
          maximumAge: 0,
        },
      );
    }, 3000);
  };

  // Update rider location
  const updateRiderLocation = (lat, lng) => {
    const newLocation = { lat, lng };
    setRiderLocation(newLocation);

    // Update marker position with smooth animation
    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLngLat([lng, lat]);
    }

    // Emit location to Socket.IO
    emitRiderLocation(lat, lng);

    // Calculate remaining distance and duration
    if (routeData?.destination) {
      calculateRemainingMetrics(lat, lng);
    }

    // Optionally center map on rider (commented out to avoid disorienting user)
    // mapRef.current?.easeTo({ center: [lng, lat], duration: 1000 });
  };

  // Calculate remaining distance and duration
  const calculateRemainingMetrics = (riderLat, riderLng) => {
    if (!routeData?.destination) return;

    const [destLng, destLat] = routeData.destination;

    // Simple haversine distance calculation
    const R = 6371; // Earth radius in km
    const dLat = ((destLat - riderLat) * Math.PI) / 180;
    const dLng = ((destLng - riderLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((riderLat * Math.PI) / 180) *
        Math.cos((destLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    setRemainingDistance(distance);

    // Estimate duration (assuming average speed of 20 km/h)
    const estimatedDuration = (distance / 20) * 60; // in minutes
    setRemainingDuration(estimatedDuration);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading delivery route...</p>
          <p className="text-gray-500 text-sm mt-2">
            Please ensure location services are enabled
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Unable to Load Map
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/rider/home")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate("/rider")}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800">
            Delivery Navigation
          </h1>
          <div className="flex items-center gap-2">
            {isTracking ? (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Tracking</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">Not tracking</span>
            )}
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-white rounded-t-3xl shadow-2xl p-6">
        <div className="max-w-2xl mx-auto">
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <Navigation className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivery Status</p>
                <p className="font-semibold text-gray-800">{deliveryStatus}</p>
              </div>
            </div>
            <button
              onClick={fetchDeliveryRoute}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Refresh Route
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Distance */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Distance</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {remainingDistance.toFixed(1)}
                    <span className="text-sm font-normal text-gray-600 ml-1">
                      km
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">ETA</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {Math.ceil(remainingDuration)}
                    <span className="text-sm font-normal text-gray-600 ml-1">
                      min
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-semibold text-gray-800">
                {Math.round(
                  ((routeData?.distance - remainingDistance) /
                    routeData?.distance) *
                    100,
                ) || 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    Math.round(
                      ((routeData?.distance - remainingDistance) /
                        routeData?.distance) *
                        100,
                    ) || 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDeliveryStatus("Going to Restaurant")}
              className={`py-3 px-4 rounded-lg font-medium transition ${
                deliveryStatus === "Going to Restaurant"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              To Restaurant
            </button>
            <button
              onClick={() => setDeliveryStatus("Delivering to Customer")}
              className={`py-3 px-4 rounded-lg font-medium transition ${
                deliveryStatus === "Delivering to Customer"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              To Customer
            </button>
          </div>
        </div>
      </div>

      {/* Recenter Button */}
      <button
        onClick={() => {
          if (riderLocation && mapRef.current) {
            mapRef.current.flyTo({
              center: [riderLocation.lng, riderLocation.lat],
              zoom: 15,
              essential: true,
            });
          }
        }}
        className="absolute top-24 right-4 z-10 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition"
        title="Center on my location"
      >
        <Navigation className="w-5 h-5 text-blue-600" />
      </button>
    </div>
  );
};

export default RiderMap;
