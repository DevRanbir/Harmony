'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useTheme } from "@/contexts/theme-context";
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
import { ScrollArea } from "@/components/scroll-area";
import { ClientRouteGuard } from "@/components/client-route-guard";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import {
  RiMapPinLine,
  RiEarthLine,
  RiNavigationLine,
  RiCameraSwitchLine,
  RiZoomInLine,
  RiZoomOutLine,
  RiCompassLine,
} from "@remixicon/react";

// Chandigarh University coordinates (Kharar, Punjab, India)
const CHANDIGARH_UNIVERSITY = {
  lat: 30.7687902,
  lng: 76.5753719
};

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('hybrid');
  const [is3D, setIs3D] = useState(true);

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
            center: CHANDIGARH_UNIVERSITY,
            zoom: 17,
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

            // Add marker for Chandigarh University using AdvancedMarkerElement
            marker = new AdvancedMarkerElement({
              position: CHANDIGARH_UNIVERSITY,
              map: mapInstance,
              title: 'Chandigarh University',
              content: markerElement
            });
          } else {
            // Fallback to classic Marker
            marker = new google.maps.Marker({
              position: CHANDIGARH_UNIVERSITY,
              map: mapInstance,
              title: 'Chandigarh University',
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

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-4 max-w-sm ${resolvedTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}">
                <h3 class="font-bold text-lg ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}">Chandigarh University</h3>
                <p class="${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-2">NH-95, Chandigarh-Ludhiana Highway, Mohali, Punjab 140413</p>
                <div class="mt-3 flex gap-2">
                  <span class="px-2 py-1 ${resolvedTheme === 'dark' ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'} text-xs rounded-full">University</span>
                  <span class="px-2 py-1 ${resolvedTheme === 'dark' ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'} text-xs rounded-full">Educational</span>
                </div>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
          });

          setMap(mapInstance);
          setMapLoaded(true);

          // Auto-open info window after a short delay
          setTimeout(() => {
            infoWindow.open(mapInstance, marker);
          }, 1000);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initializeMap();
  }, [mapType, is3D, resolvedTheme]);

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
      map.setCenter(CHANDIGARH_UNIVERSITY);
      map.setZoom(17);
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

              <div className="absolute inset-0 top-[73px]">
                {/* Map Controls */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  {/* Map Type Controls */}
                  <div className="bg-background border border-border rounded-lg shadow-lg p-2 space-y-2 transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-xl">
                    <div className="text-xs font-medium text-muted-foreground px-2">Map Type</div>
                    <div className="grid grid-cols-2 gap-1">
                      {(['roadmap', 'satellite', 'hybrid', 'terrain'] as const).map((type) => (
                        <Button
                          key={type}
                          variant={mapType === type ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleMapTypeChange(type)}
                          className="h-8 text-xs capitalize transition-all duration-200 transform hover:scale-[1.05] active:scale-[0.95]"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* View Controls */}
                  <div className="bg-background border border-border rounded-lg shadow-lg p-2 space-y-2 transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-xl">
                    <Button
                      variant={is3D ? "default" : "ghost"}
                      size="sm"
                      onClick={toggle3D}
                      className="w-full h-8 text-xs transition-all duration-200 transform hover:scale-[1.05] active:scale-[0.95]"
                    >
                      <RiEarthLine className="w-3 h-3 mr-1" />
                      3D View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetView}
                      className="w-full h-8 text-xs transition-all duration-200 transform hover:scale-[1.05] active:scale-[0.95]"
                    >
                      <RiCompassLine className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="bg-background border border-border rounded-lg shadow-lg p-1 space-y-1 transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-xl">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={zoomIn}
                      className="w-full h-8 justify-center p-0 transition-all duration-200 transform hover:scale-[1.05] active:scale-[0.95]"
                    >
                      <RiZoomInLine className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={zoomOut}
                      className="w-full h-8 justify-center p-0 transition-all duration-200 transform hover:scale-[1.05] active:scale-[0.95]"
                    >
                      <RiZoomOutLine className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Location Info */}
                <div className="absolute bottom-4 left-4 z-10">
                  <div className="bg-background border border-border rounded-lg shadow-lg p-4 max-w-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <RiMapPinLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-foreground">Current Location</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Chandigarh University</p>
                    <p className="text-xs text-muted-foreground">Kharar, Punjab, India</p>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Educational Campus
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        University
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {!mapLoaded && (
                  <div className="absolute inset-0 bg-background flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted-foreground/30 border-t-foreground mb-4 mx-auto"></div>
                      <p className="text-foreground">Loading 3D Map...</p>
                      <p className="text-sm text-muted-foreground mt-1">Chandigarh University</p>
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
              </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</ClientRouteGuard>
  );
}