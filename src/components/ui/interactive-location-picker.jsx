import { useEffect, useRef } from 'react';

export function InteractiveLocationPicker({ onLocationSelect, selectedLocation }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps) {
      console.warn('Google Maps not loaded');
      return;
    }

    // Centro em Portugal
    const defaultCenter = { lat: 39.3999, lng: -8.2245 };
    
    // Inicializar mapa
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: selectedLocation || defaultCenter,
      zoom: selectedLocation ? 12 : 7,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "transit",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ],
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true
    });

    // Configurar marcador se já houver localização
    if (selectedLocation) {
      updateMarker(selectedLocation);
    }

    // Clique no mapa para adicionar/mover marcador
    const clickListener = mapInstance.current.addListener('click', (event) => {
      const newLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      updateMarker(newLocation);
      onLocationSelect(newLocation);
    });

    return () => {
      if (clickListener) {
        window.google.maps.event.removeListener(clickListener);
      }
    };

  }, []);

  const updateMarker = (location) => {
    // Remover marcador anterior
    if (marker.current) {
      marker.current.setMap(null);
    }

    // Criar novo marcador
    marker.current = new window.google.maps.Marker({
      position: location,
      map: mapInstance.current,
      draggable: true,
      title: "Localização da Escola",
      icon: {
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2C11.58 2 8 5.58 8 10C8 16 16 30 16 30C16 30 24 16 24 10C24 5.58 20.42 2 16 2Z" fill="#8B5CF6"/>
            <circle cx="16" cy="10" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 32)
      }
    });

    // Evento para arrastar marcador
    marker.current.addListener('dragend', (event) => {
      const newLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      onLocationSelect(newLocation);
    });

    // Centralizar mapa na nova localização
    mapInstance.current.setCenter(location);
    mapInstance.current.setZoom(14);
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border">
      <div 
        ref={mapRef} 
        className="w-full h-64"
      />
      <div className="p-3 bg-muted/50 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          📍 Clique no mapa para selecionar a localização da escola
        </p>
        {selectedLocation && (
          <p className="text-xs text-center text-green-600 mt-1">
            Localização selecionada: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        )}
      </div>
    </div>
  );
}