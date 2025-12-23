import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

function NavigationMap({ 
  isOpen, 
  onClose, 
  riderLocation, 
  destinationLocation,
  destinationName,
  destinationColor = "#289c40",
  riderColor = "#8a122c"
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current || !riderLocation || !destinationLocation) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    // Initialize map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [riderLocation.lng, riderLocation.lat],
      zoom: 12
    });

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add rider marker
    new mapboxgl.Marker({ color: riderColor })
      .setLngLat([riderLocation.lng, riderLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>Your Location</strong>'))
      .addTo(mapRef.current);

    // Add destination marker
    new mapboxgl.Marker({ color: destinationColor })
      .setLngLat([destinationLocation.lng, destinationLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${destinationName}</strong>`))
      .addTo(mapRef.current);

    // Fit map to show both markers
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([riderLocation.lng, riderLocation.lat]);
    bounds.extend([destinationLocation.lng, destinationLocation.lat]);

    mapRef.current.fitBounds(bounds, {
      padding: 80,
      maxZoom: 15
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen, riderLocation, destinationLocation, destinationName, destinationColor, riderColor]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold text-gray-900">Navigate to {destinationName}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none w-8 h-8"
          >
            ×
          </button>
        </div>
        
        <div 
          ref={mapContainerRef} 
          className="w-full h-[500px]"
        />

        <div className="p-4 bg-gray-50 flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: riderColor }}></div>
              <span className="text-sm font-medium text-gray-700">Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: destinationColor }}></div>
              <span className="text-sm font-medium text-gray-700">{destinationName}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default NavigationMap;
