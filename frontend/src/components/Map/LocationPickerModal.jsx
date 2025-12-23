import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const LocationPickerModal = ({ 
  isOpen, 
  onClose, 
  onLocationSelect, 
  initialLocation = null,
  title = "Select Location",
  markerColor = "#8a122c", // Default to primary color from tailwind.config.js
  isMandatory = false // If true, prevents closing without selecting location
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Initialize Mapbox (using public token for now - replace with your token)
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    
    const initialCenter = initialLocation 
      ? [initialLocation.lng, initialLocation.lat]
      : [90.4125, 23.8103]; // Default: Dhaka, Bangladesh

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: initialCenter,
      zoom: 12
    });

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control (use current location)
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: false,
      showUserHeading: false
    });
    
    mapRef.current.addControl(geolocateControl, 'top-right');

    // If initial location exists, add marker
    if (initialLocation) {
      markerRef.current = new mapboxgl.Marker({ 
        draggable: true,
        color: markerColor
      })
        .setLngLat([initialLocation.lng, initialLocation.lat])
        .addTo(mapRef.current);

      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current.getLngLat();
        setSelectedLocation({ lng: lngLat.lng, lat: lngLat.lat });
      });
    }

    // Click to place/move marker
    mapRef.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ 
          draggable: true,
          color: markerColor
        })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        markerRef.current.on('dragend', () => {
          const lngLat = markerRef.current.getLngLat();
          setSelectedLocation({ lng: lngLat.lng, lat: lngLat.lat });
        });
      }

      setSelectedLocation({ lng, lat });
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen, initialLocation]);

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    } else {
      alert('Please select a location on the map');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
      onClick={isMandatory ? undefined : onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          {!isMandatory && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none w-8 h-8"
            >
              ×
            </button>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-3">
          📍 Click on the map to select location, or drag the marker
        </p>
        
        <div 
          ref={mapContainerRef} 
          className="h-96 w-full rounded-lg mb-3"
        />

        {selectedLocation && (
          <div className="text-xs text-gray-600 mb-3">
            Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          {!isMandatory && (
            <button 
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
          )}
          <button 
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className="px-6 py-2.5 rounded-lg text-white font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed bg-primary hover:bg-primary/90"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
