import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const DeliveryMap = ({ restaurantLocation, customerLocation, routeGeometry }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!restaurantLocation || !customerLocation || !mapContainerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: restaurantLocation,
      zoom: 13
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Restaurant marker (red)
    new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat(restaurantLocation)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          '<div style="padding: 8px;"><h4>🍽️ Restaurant</h4></div>'
        )
      )
      .addTo(mapRef.current);

    // Customer marker (green)
    new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat(customerLocation)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          '<div style="padding: 8px;"><h4>🏠 Customer</h4></div>'
        )
      )
      .addTo(mapRef.current);

    // Draw route if geometry is provided
    if (routeGeometry) {
      mapRef.current.on('load', () => {
        mapRef.current.addSource('route', {
          type: 'geojson',
          data: routeGeometry
        });

        mapRef.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      });
    }

    // Fit bounds to show both locations
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend(restaurantLocation);
    bounds.extend(customerLocation);
    mapRef.current.fitBounds(bounds, { padding: 80 });

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [restaurantLocation, customerLocation, routeGeometry]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        height: '400px', 
        width: '100%', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}
    />
  );
};

export default DeliveryMap;
