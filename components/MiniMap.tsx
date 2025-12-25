
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom Icon for property marker
const PropertyIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MiniMapProps {
    lat: number;
    lon: number;
    title: string;
}

export default function MiniMap({ lat, lon, title }: MiniMapProps) {
    return (
        <MapContainer
            center={[lat, lon]}
            zoom={15}
            className="h-full w-full z-0"
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <Marker position={[lat, lon]} icon={PropertyIcon}>
                <Popup>
                    <div className="font-semibold">{title}</div>
                </Popup>
            </Marker>
        </MapContainer>
    );
}
