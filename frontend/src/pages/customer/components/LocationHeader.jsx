import React from 'react';

const LocationHeader = ({ currentLocation, onLocationChange, lastUpdated }) => {
  const formatLocation = (location) => {
    if (!location) return 'Set your location';
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <button
          onClick={onLocationChange}
          className="flex items-center gap-3 w-full hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
        >
          <span className="text-2xl">📍</span>
          <div className="flex-1 text-left">
            <p className="text-xs text-gray-500">Delivering to</p>
            <p className="font-semibold text-gray-900">
              {formatLocation(currentLocation)}
            </p>
            {lastUpdated && (
              <p className="text-xs text-gray-400">
                Updated {formatTimeAgo(lastUpdated)}
              </p>
            )}
          </div>
          <span className="text-gray-400">▼</span>
        </button>
      </div>
    </div>
  );
};

export default LocationHeader;
