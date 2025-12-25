
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Property, Coordinates } from '@/types';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default Leaflet marker icons in Next.js/Webpack
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

// Custom Icon for Hover
const HoverIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom Icon for Center
const CenterIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 13);
    }, [center, map]);
    return null;
}

interface MapProps {
    properties: Property[];
    center: Coordinates;
    hoveredPropertyId?: string | null;
}

export default function Map({ properties, center, hoveredPropertyId }: MapProps) {
    return (
        <MapContainer
            center={[center.lat, center.lon]}
            zoom={13}
            className="h-full w-full z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* Metro/Railway Lines Overlay from OpenRailwayMap */}
            <TileLayer
                url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
                attribution='<a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>'
                opacity={0.7}
            />

            <MapUpdater center={[center.lat, center.lon]} />

            {/* Center Marker */}
            <Marker position={[center.lat, center.lon]} icon={CenterIcon}>
                <Popup>Search Center ({center.placeName})</Popup>
            </Marker>

            {/* Property Markers */}
            {properties.map(p => (
                <Marker
                    key={p.id}
                    position={[p.latitude, p.longitude]}
                    icon={hoveredPropertyId === p.id ? HoverIcon : DefaultIcon}
                >
                    <Popup>
                        <div className="w-48">
                            <h4 className="font-bold text-sm truncate">{p.propertyTitle}</h4>
                            <p className="text-xs font-semibold">₹{p.rent}</p>
                            <a href={`https://www.nobroker.in${p.detailUrl}`} target="_blank" className="text-xs text-blue-600 underline">View</a>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
