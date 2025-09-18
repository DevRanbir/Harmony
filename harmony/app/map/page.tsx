'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useTheme } from "@/contexts/theme-context";
import { useSearchParams, useRouter } from 'next/navigation';
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/breadcrumb";
import { ClientRouteGuard } from "@/components/client-route-guard";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import Dock from "@/components/Dock";
import {
  RiMapPinLine,
  RiEarthLine,
  RiZoomInLine,
  RiZoomOutLine,
  RiCompassLine,
  RiSearchLine,
  RiRoadMapLine,
  RiGlobalLine,
  RiImageLine,
  RiMapLine,
} from "@remixicon/react";

// TypeScript interfaces for Google Maps API responses
interface GeocodeAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodeResult {
  formatted_address: string;
  address_components?: GeocodeAddressComponent[];
}

interface GeocodeResponse {
  status: string;
  results: GeocodeResult[];
}

interface LocationDetails {
  country?: string;
  state?: string;
  city?: string;
  area?: string;
  postalCode?: string;
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('hybrid');
  const [is3D, setIs3D] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapTypeIndex, setMapTypeIndex] = useState(2); // Start with hybrid (index 2)

  // Helper: fetch search suggestions using actual Google Places API
  const fetchSearchSuggestions = async (query: string): Promise<string[]> => {
    if (!query || query.length < 2) return [];
    
    try {
      // Use Google Maps Geocoding API for suggestions
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) return [query];
      
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
      const res = await fetch(url);
      const data: GeocodeResponse = await res.json();
      
      if (data.status === "OK" && data.results) {
        // Get top 4 suggestions from geocoding results
        const suggestions = data.results
          .slice(0, 4)
          .map((result: GeocodeResult) => result.formatted_address)
          .filter((address: string) => address.toLowerCase().includes(query.toLowerCase()));
        
        // Always include the original query as the first option
        return [query, ...suggestions.filter((s: string) => s !== query)];
      }
      
      // Fallback to just the query if no results
      return [query];
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [query];
    }
  };

  // Handle search input changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchValue.length >= 3) { // Increased to 3 characters for better results
        const suggestions = await fetchSearchSuggestions(searchValue);
        setSearchSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500); // Increased delay to reduce API calls

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  // Helper: fetch additional place details
  const getPlaceDetails = async (lat: number, lng: number): Promise<{
    country?: string;
    state?: string;
    city?: string;
    area?: string;
    postalCode?: string;
  }> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) return {};
      
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
      const res = await fetch(url);
      const data: GeocodeResponse = await res.json();
      
      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];
        const details: LocationDetails = {};
        
        result.address_components?.forEach((component: GeocodeAddressComponent) => {
          if (component.types.includes('country')) {
            details.country = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            details.state = component.long_name;
          }
          if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
            details.city = component.long_name;
          }
          if (component.types.includes('sublocality_level_1') || component.types.includes('neighborhood')) {
            details.area = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            details.postalCode = component.long_name;
          }
        });
        
        return details;
      }
      return {};
    } catch (error) {
      console.error("Error fetching place details:", error);
      return {};
    }
  };

  // Helper: fetch lat/lng from Google Maps Geocoding API
  const searchPlace = async (query: string): Promise<{lat: number, lng: number, description: string} | null> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) return null;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        const description = data.results[0].formatted_address;
        return { lat, lng, description };
      }
      return null;
    } catch (error) {
      console.error("Error searching place:", error);
      return null;
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim() || isSearching) return;
    
    setIsSearching(true);
    setShowSuggestions(false); // Hide suggestions while searching
    
    const locationData = await searchPlace(searchValue);
    setIsSearching(false);
    
    if (locationData) {
      // Clear suggestions after successful search
      setSearchSuggestions([]);
      // Update URL with new location
      const newUrl = `/map?lat=${locationData.lat}&lng=${locationData.lng}&location=${encodeURIComponent(locationData.description)}`;
      router.push(newUrl);
    } else {
      // Show error or keep current view
      console.warn(`No results found for: ${searchValue}`);
      // You could add a toast notification here
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSearchSuggestions([]); // Also clear suggestions on escape
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchValue(suggestion);
    setShowSuggestions(false);
    setSearchSuggestions([]); // Clear suggestions after selection
    setIsSearching(true);
    
    // Trigger search with the selected suggestion
    searchPlace(suggestion).then(locationData => {
      setIsSearching(false);
      if (locationData) {
        const newUrl = `/map?lat=${locationData.lat}&lng=${locationData.lng}&location=${encodeURIComponent(locationData.description)}`;
        router.push(newUrl);
      } else {
        console.warn(`No results found for suggestion: ${suggestion}`);
      }
    }).catch(error => {
      setIsSearching(false);
      console.error("Error searching suggestion:", error);
    });
  };
  // Get location from URL parameters
  const urlLat = searchParams.get('lat');
  const urlLng = searchParams.get('lng');
  const urlLocation = searchParams.get('location');
  
  const targetLocation = (urlLat && urlLng) ? {
    lat: parseFloat(urlLat),
    lng: parseFloat(urlLng)
  } : null;

  // Default map center (India) when no specific location is provided
  const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629
  };

  // Map type cycle function
  const mapTypes = ['roadmap', 'satellite', 'hybrid', 'terrain'] as const;
  const mapTypeIcons = [RiRoadMapLine, RiImageLine, RiGlobalLine, RiMapLine];
  const mapTypeLabels = ['Roadmap', 'Satellite', 'Hybrid', 'Terrain'];

  const toggleMapType = () => {
    const nextIndex = (mapTypeIndex + 1) % mapTypes.length;
    setMapTypeIndex(nextIndex);
    handleMapTypeChange(mapTypes[nextIndex]);
  };

  // Dock items for map controls
  const dockItems = [
    {
      icon: React.createElement(mapTypeIcons[mapTypeIndex], { size: 20, className: "text-foreground" }),
      label: mapTypeLabels[mapTypeIndex],
      onClick: toggleMapType,
      className: 'bg-primary/20'
    },
    {
      icon: <RiEarthLine size={20} className="text-foreground" />,
      label: is3D ? 'Disable 3D' : 'Enable 3D',
      onClick: () => toggle3D(),
      className: is3D ? 'bg-primary/20' : ''
    },
    {
      icon: <RiZoomInLine size={20} className="text-foreground" />,
      label: 'Zoom In',
      onClick: () => zoomIn()
    },
    {
      icon: <RiZoomOutLine size={20} className="text-foreground" />,
      label: 'Zoom Out',
      onClick: () => zoomOut()
    },
    {
      icon: <RiCompassLine size={20} className="text-foreground" />,
      label: 'Reset View',
      onClick: () => resetView()
    }
  ];

  // Dark mode Google Maps styles
  const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "administrative.country",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "administrative.land_parcel",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#bdbdbd" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#181818" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#1b1b1b" }],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#2c2c2c" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8a8a8a" }],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#373737" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#3c3c3c" }],
    },
    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry",
      stylers: [{ color: "#4e4e4e" }],
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      featureType: "transit",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#000000" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#3d3d3d" }],
    },
  ];

  // Light mode Google Maps styles (minimal/default)
  const lightMapStyles = [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "on" }]
    }
  ];

  useEffect(() => {
    const initializeMap = async () => {
      // Ensure the map container exists
      if (!mapRef.current) {
        console.warn('Map container not ready');
        return;
      }

      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '', // You'll need to add your API key
        version: 'weekly',
        libraries: ['places', 'geometry', 'marker']
      });

      try {
        const { Map } = await loader.importLibrary('maps');
        let AdvancedMarkerElement;
        
        try {
          const markerLib = await loader.importLibrary('marker');
          AdvancedMarkerElement = markerLib.AdvancedMarkerElement;
        } catch (markerError) {
          console.warn('AdvancedMarkerElement not available, falling back to classic Marker');
        }
        
        if (mapRef.current) {
          const mapInstance = new Map(mapRef.current, {
            center: targetLocation || defaultCenter,
            zoom: targetLocation ? 17 : 5,
            mapTypeId: mapType,
            tilt: is3D ? 45 : 0, // Enable 3D view
            heading: 90, // Rotation angle
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: true,
            zoomControl: false,
            scaleControl: true,
            rotateControl: true,
            mapId: AdvancedMarkerElement ? '4504f8b37365c3d0' : undefined, // Use map ID only if AdvancedMarkerElement is available
            styles: resolvedTheme === 'dark' ? darkMapStyles : lightMapStyles
          });

          setMap(mapInstance);
          setMapLoaded(true);

          // Only create marker if there's a target location from URL parameters
          if (targetLocation) {
            let marker;
            
            if (AdvancedMarkerElement) {
              // Create a custom marker element
              const markerElement = document.createElement('div');
              markerElement.innerHTML = `
                <div style="
                  background: #4F46E5;
                  border: 3px solid ${resolvedTheme === 'dark' ? '#374151' : 'white'};
                  border-radius: 50%;
                  width: 24px;
                  height: 24px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 2px 8px rgba(0,0,0,${resolvedTheme === 'dark' ? '0.6' : '0.3'});
                ">
                  <div style="
                    background: ${resolvedTheme === 'dark' ? '#374151' : 'white'};
                    border-radius: 50%;
                    width: 8px;
                    height: 8px;
                  "></div>
                </div>
              `;

              // Add marker for the target location using AdvancedMarkerElement
              marker = new AdvancedMarkerElement({
                position: targetLocation,
                map: mapInstance,
                title: urlLocation || 'Location',
                content: markerElement
              });
            } else {
              // Fallback to classic Marker
              marker = new google.maps.Marker({
                position: targetLocation,
                map: mapInstance,
                title: urlLocation || 'Location',
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 12,
                  fillColor: '#4F46E5',
                  fillOpacity: 0.9,
                  strokeWeight: 3,
                  strokeColor: '#FFFFFF',
                }
              });
            }

            // Add info window with enhanced details
            const placeDetails = await getPlaceDetails(targetLocation.lat, targetLocation.lng);
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div class="p-4 max-w-sm ${resolvedTheme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}">
                  <h3 class="font-bold text-lg ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}">${urlLocation || 'Location'}</h3>
                  <div class="mt-2 space-y-2">
                    <p class="${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm">
                      <strong>Coordinates:</strong><br>
                      Lat: ${targetLocation.lat.toFixed(6)}, Lng: ${targetLocation.lng.toFixed(6)}
                    </p>
                    ${placeDetails.area ? `<p class="${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm"><strong>Area:</strong> ${placeDetails.area}</p>` : ''}
                    ${placeDetails.city ? `<p class="${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm"><strong>City:</strong> ${placeDetails.city}</p>` : ''}
                    ${placeDetails.state ? `<p class="${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm"><strong>State:</strong> ${placeDetails.state}</p>` : ''}
                    ${placeDetails.country ? `<p class="${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm"><strong>Country:</strong> ${placeDetails.country}</p>` : ''}
                    ${placeDetails.postalCode ? `<p class="${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm"><strong>Postal Code:</strong> ${placeDetails.postalCode}</p>` : ''}
                  </div>
                  <div class="mt-3 flex gap-2">
                    <span class="px-2 py-1 ${resolvedTheme === 'dark' ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'} text-xs rounded-full">📍 Location</span>
                    ${placeDetails.city ? `<span class="px-2 py-1 ${resolvedTheme === 'dark' ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'} text-xs rounded-full">🏙️ ${placeDetails.city}</span>` : ''}
                  </div>
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open(mapInstance, marker);
            });

            // Auto-open info window after a short delay
            setTimeout(() => {
              infoWindow.open(mapInstance, marker);
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initializeMap();
  }, [mapType, is3D, resolvedTheme, targetLocation?.lat, targetLocation?.lng, urlLocation]);

  const handleMapTypeChange = (newMapType: typeof mapType) => {
    setMapType(newMapType);
    if (map) {
      map.setMapTypeId(newMapType);
    }
  };

  const toggle3D = () => {
    setIs3D(!is3D);
    if (map) {
      map.setTilt(is3D ? 0 : 45);
    }
  };

  const zoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom() || 17;
      map.setZoom(currentZoom + 1);
    }
  };

  const zoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom() || 17;
      map.setZoom(Math.max(currentZoom - 1, 1));
    }
  };

  const resetView = () => {
    if (map) {
      const centerLocation = targetLocation || defaultCenter;
      map.setCenter(centerLocation);
      map.setZoom(targetLocation ? 17 : 5);
      map.setTilt(45);
      map.setHeading(90);
    }
  };

  return (
    <ClientRouteGuard requireAuth={true} lightLoading={true}>
      <SidebarProvider>
        <AppSidebar collapsible="hidden" />
        <SidebarInset className="bg-sidebar group/sidebar-inset">
          <div className="flex h-[calc(100svh)] bg-sidebar md:rounded-s-3xl md:group-peer-data-[state=collapsed]/sidebar-inset:rounded-s-none transition-all ease-in-out duration-300">
            <div className="flex-1 w-full shadow-md md:rounded-s-[inherit] min-[1024px]:rounded-e-3xl bg-background relative overflow-hidden">
              {/* Header */}
              <header className="py-5 bg-background sticky top-0 z-20 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>3D Map</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>

              {/* Search Bar */}
              <div className="px-8 pt-2 bg-transparent sticky top-[73px] z-20 before:absolute before:bottom-0 before:h-px">
                <div className="max-w mx-auto relative">
                  <div className="relative">
                    <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/70 w-4 h-4" />
                    <Input
                      type="search"
                      placeholder="Search for cities, landmarks, addresses..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={handleSearchKeyPress}
                      onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="pl-10 pr-20"
                      disabled={isSearching}
                    />
                    <Button
                      size="sm"
                      onClick={handleSearch}
                      disabled={!searchValue.trim() || isSearching}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7"
                    >
                      {isSearching ? "..." : "Search"}
                    </Button>
                  </div>
                  
                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-4 py-2 hover:bg-muted/50 text-sm border-b border-border/50 last:border-b-0 transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="flex items-center gap-2">
                            <RiMapPinLine className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute inset-0 top-[130px]">
                {/* Loading State */}
                {!mapLoaded && (
                  <div className="absolute inset-0 bg-background flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted-foreground/30 border-t-foreground mb-4 mx-auto"></div>
                      <p className="text-foreground">Loading 3D Map...</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {urlLocation ? urlLocation : 'Interactive Map'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Map Container */}
                <div
                  ref={mapRef}
                  className="w-full h-full"
                  style={{ minHeight: '500px' }}
                  onError={(e) => console.error('Map container error:', e)}
                />

                {/* Dock Controls at Bottom */}
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 z-20">
                  <Dock
                    items={dockItems}
                    className="bg-background/80 backdrop-blur-md border border-border/50 shadow-lg"
                    panelHeight={64}
                    baseItemSize={48}
                    magnification={64}
                    distance={180}
                  />
                </div>
              </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</ClientRouteGuard>
  );
}