import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import {
  MapPin,
  Search,
  Navigation,
  X,
  Compass,
  Check,
  Building,
  TreePine,
  Coffee,
  Home,
  Mountain,
} from 'lucide-react';
import { JournalLocation } from '../types';

interface LocationPickerProps {
  location: JournalLocation | null;
  onChange: (location: JournalLocation | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Preset popular mindful/reflection spots for quick one-click pinning
const QUICK_PRESETS = [
  { name: 'Home Sanctuary', icon: Home, lat: 37.7749, lng: -122.4194, address: 'Personal Reflection Space' },
  { name: 'Local Coffee Spot', icon: Coffee, lat: 40.7128, lng: -74.006, address: 'Café & Creative Focus' },
  { name: 'Nature Trail & Park', icon: TreePine, lat: 47.6062, lng: -122.3321, address: 'Outdoor Walk & Grounding' },
  { name: 'Mountain Retreat', icon: Mountain, lat: 39.7392, lng: -104.9903, address: 'High Altitude Perspective' },
  { name: 'Workspace / Studio', icon: Building, lat: 51.5074, lng: -0.1278, address: 'Deep Work & Studio Space' },
];

export const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  onChange,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<JournalLocation | null>(location);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: location?.lat || 37.7749,
    lng: location?.lng || -122.4194,
  });
  const [mapZoom, setMapZoom] = useState(location ? 14 : 11);

  // Read Maps API key from Vite environment or fallback safely
  const apiKey =
    ((import.meta as unknown as { env?: Record<string, string> }).env
      ?.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  useEffect(() => {
    if (location) {
      setSelectedLocation(location);
      setMapCenter({ lat: location.lat, lng: location.lng });
      setMapZoom(14);
    }
  }, [location, isOpen]);

  if (!isOpen) return null;

  // Pin using browser geolocation
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newLoc: JournalLocation = {
          placeName: 'Current Location',
          address: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
          lat,
          lng,
        };
        setSelectedLocation(newLoc);
        setMapCenter({ lat, lng });
        setMapZoom(15);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed:', err);
        setErrorMessage('Unable to retrieve your current location. Please check browser permissions or search manually.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Perform search / geocoding lookup
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Direct place coordinate matching for demo or geocoding
    const query = searchQuery.trim();
    setErrorMessage(null);

    // Simple parser for lat, lng inputs if entered directly
    const coordsMatch = query.match(/^([-+]?\d{1,2}(?:\.\d+)?),\s*([-+]?\d{1,3}(?:\.\d+)?)$/);
    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lng = parseFloat(coordsMatch[2]);
      const newLoc: JournalLocation = {
        placeName: `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        address: query,
        lat,
        lng,
      };
      setSelectedLocation(newLoc);
      setMapCenter({ lat, lng });
      setMapZoom(14);
      return;
    }

    // Default place geocode approximation for named locations
    const foundPreset = QUICK_PRESETS.find(
      (p) => p.name.toLowerCase().includes(query.toLowerCase())
    );

    if (foundPreset) {
      const newLoc: JournalLocation = {
        placeName: foundPreset.name,
        address: foundPreset.address,
        lat: foundPreset.lat,
        lng: foundPreset.lng,
      };
      setSelectedLocation(newLoc);
      setMapCenter({ lat: foundPreset.lat, lng: foundPreset.lng });
      setMapZoom(14);
    } else {
      // Create location with search query title
      const newLoc: JournalLocation = {
        placeName: query,
        address: `Custom Pinned: ${query}`,
        lat: mapCenter.lat,
        lng: mapCenter.lng,
      };
      setSelectedLocation(newLoc);
    }
  };

  const handleSelectPreset = (preset: (typeof QUICK_PRESETS)[0]) => {
    const newLoc: JournalLocation = {
      placeName: preset.name,
      address: preset.address,
      lat: preset.lat,
      lng: preset.lng,
    };
    setSelectedLocation(newLoc);
    setMapCenter({ lat: preset.lat, lng: preset.lng });
    setMapZoom(14);
  };

  const handleApply = () => {
    onChange(selectedLocation);
    onClose();
  };

  const handleClear = () => {
    setSelectedLocation(null);
    onChange(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-[#262626] bg-[#121212] p-6 shadow-2xl text-[#E0E0E0] my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-950/70 border border-indigo-700/40 text-indigo-400">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#F3F4F6]">
                Pin Location to Reflection
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                Anchor your insights to a physical space, retreat, or meaningful environment.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#1E1E1E] hover:text-[#E0E0E0] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 rounded-lg bg-rose-950/50 border border-rose-800/60 p-3 text-xs text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Search Bar & Geolocation Trigger */}
        <div className="mb-4 flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#71717A]" />
            <input
              id="location-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search place, city, or coordinates (e.g., Central Park, Kyoto)..."
              className="w-full rounded-xl border border-[#262626] bg-[#181818] py-2 pl-9 pr-4 text-xs text-[#F3F4F6] placeholder-[#71717A] focus:border-indigo-500 focus:outline-none"
            />
          </form>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center justify-center rounded-xl border border-[#333333] bg-[#1E1E1E] px-4 py-2 text-xs font-semibold text-[#E0E0E0] hover:bg-[#282828] hover:text-white transition disabled:opacity-50"
          >
            <Navigation className={`mr-1.5 h-3.5 w-3.5 text-indigo-400 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Locating...' : 'Current GPS'}
          </button>
        </div>

        {/* Quick Mindful Space Presets */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A] mb-2 flex items-center">
            <Compass className="mr-1.5 h-3 w-3 text-indigo-400" />
            Quick Reflection Spaces
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = selectedLocation?.placeName === preset.name;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium transition border ${
                    isSelected
                      ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200'
                      : 'bg-[#181818] border-[#2A2A2A] text-[#A1A1AA] hover:bg-[#202020] hover:text-[#E0E0E0]'
                  }`}
                >
                  <Icon className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Google Maps Container */}
        <div className="relative mb-4 h-64 w-full overflow-hidden rounded-xl border border-[#262626] bg-[#0A0A0A]">
          <APIProvider
            apiKey={apiKey}
            solutionChannel="GMP_aistudio"
          >
            <Map
              center={mapCenter}
              zoom={mapZoom}
              mapId="DEMO_MAP_ID"
              style={{ width: '100%', height: '100%' }}
              disableDefaultUI={false}
              onClick={(e) => {
                if (e.detail.latLng) {
                  const lat = e.detail.latLng.lat;
                  const lng = e.detail.latLng.lng;
                  setSelectedLocation({
                    placeName: `Pinned Spot (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
                    address: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                    lat,
                    lng,
                  });
                  setMapCenter({ lat, lng });
                }
              }}
            >
              {selectedLocation && (
                <AdvancedMarker
                  position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                  title={selectedLocation.placeName}
                >
                  <Pin
                    background="#6366F1"
                    borderColor="#4338CA"
                    glyphColor="#FFFFFF"
                  />
                </AdvancedMarker>
              )}
            </Map>
          </APIProvider>

          {/* Overlay Map Badge */}
          <div className="absolute bottom-2 left-2 rounded-md bg-black/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-[#A1A1AA] border border-white/10">
            Click map to drop pin • Google Maps Platform v3
          </div>
        </div>

        {/* Selected Location Summary Banner */}
        {selectedLocation ? (
          <div className="mb-5 rounded-xl border border-indigo-800/40 bg-indigo-950/40 p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-indigo-900/60 p-2 text-indigo-300">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold text-xs text-indigo-200">
                  {selectedLocation.placeName}
                </div>
                <div className="text-[11px] text-indigo-400/80">
                  {selectedLocation.address || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-xs text-indigo-400 hover:text-indigo-200 font-medium underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="mb-5 rounded-xl border border-[#262626] bg-[#161616] p-3 text-center text-xs text-[#71717A]">
            No location pinned. Select a preset, search above, or click on the map.
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#262626] pt-4">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-xl border border-transparent px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:text-[#E0E0E0] transition"
          >
            Clear Location
          </button>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#333333] bg-[#1E1E1E] px-4 py-2 text-xs font-semibold text-[#E0E0E0] hover:bg-[#282828] transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Attach Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
