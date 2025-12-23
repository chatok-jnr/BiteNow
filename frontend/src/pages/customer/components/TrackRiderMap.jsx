import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

function TrackRiderMap({ 
  isOpen, 
  onClose, 
  riderLocation, 
  customerLocation,
  riderLocationUpdatedAt,
  restaurantName
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current || !riderLocation || !customerLocation) return;

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

    // Add rider marker (orange)
    new mapboxgl.Marker({ color: '#fb923c' })
      .setLngLat([riderLocation.lng, riderLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>Rider Location</strong>'))
      .addTo(mapRef.current);

    // Add customer location marker (maroon/primary)
    new mapboxgl.Marker({ color: '#8a122c' })
      .setLngLat([customerLocation.lng, customerLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>Your Delivery Location</strong>'))
      .addTo(mapRef.current);

    // Fit map to show both markers
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([riderLocation.lng, riderLocation.lat]);
    bounds.extend([customerLocation.lng, customerLocation.lat]);

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
  }, [isOpen, riderLocation, customerLocation]);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Track Your Delivery</h3>
            <p className="text-sm text-gray-600 mt-1">Order from {restaurantName}</p>
          </div>
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

        <div className="p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#fb923c]"></div>
                <span className="text-sm font-medium text-gray-700">Rider</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#8a122c]"></div>
                <span className="text-sm font-medium text-gray-700">Your Location</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Rider location updated: <span className="font-semibold">{formatTimeAgo(riderLocationUpdatedAt)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TrackRiderMap;
