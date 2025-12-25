'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Property, LocationCluster, Coordinates } from '@/types';
import { FilterBar } from '@/components/FilterBar';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyModal } from '@/components/PropertyModal';
import dynamic from 'next/dynamic';
import { Loader2, Map as MapIcon, List, Zap, MapPinned, Heart } from 'lucide-react';
import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';

const Map = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">Loading Map...</div>
});

// Decoded Metro Line Clusters
const METRO_CLUSTERS: LocationCluster[] = [
    {
        id: 'green_south',
        name: 'Green Line (South)',
        color: 'bg-green-600',
        center: { lat: 12.9250, lon: 77.5800 },
        locations: [
            { "lat": 12.946287, "lon": 77.5800611, "placeId": "ChIJFZ7lcOsVrjsRpI3gtGXhbdc", "placeName": "Lalbagh" },
            { "lat": 12.9383208, "lon": 77.58007479999999, "placeId": "ChIJUeZ3HZQVrjsRYSbTWxcLXZI", "placeName": "South End Circle" },
            { "lat": 12.9296749, "lon": 77.5801753, "placeId": "ChIJ6zSXdpkVrjsRvb2SqkmrHBc", "placeName": "Jayanagara" },
            { "lat": 12.9215877, "lon": 77.5802611, "placeId": "ChIJGymEHp4VrjsRR5cYC8E5tWM", "placeName": "Rashtreeya Vidyalaya Road" },
            { "lat": 12.9155385, "lon": 77.5736288, "placeId": "ChIJFfoeVXcVrjsRUKMZuV47coQ", "placeName": "Banashankari" },
            { "lat": 12.9075563, "lon": 77.573061, "placeId": "ChIJCwCOfGUVrjsRkNcI9wbOo4Q", "placeName": "Jayaprakash Nagara" },
            { "lat": 12.8960529, "lon": 77.5701606, "placeId": "ChIJezEhr10VrjsR8Kkc4v3gXeo", "placeName": "Yelachenahalli" }
        ]
    },
    {
        id: 'purple_east',
        name: 'Purple Line (East)',
        color: 'bg-purple-600',
        center: { lat: 12.9780, lon: 77.6200 },
        locations: [
            { "lat": 12.9782619, "lon": 77.63852570000002, "placeId": "ChIJZbZd-qQWrjsRe7G5a9GUZ9U", "placeName": "Indiranagara" },
            { "lat": 12.9763269, "lon": 77.62669749999999, "placeId": "ChIJSd03apkWrjsRmpKnR3Cq5Ck", "placeName": "Halasuru" },
            { "lat": 12.9859106, "lon": 77.645004, "placeId": "ChIJP-ri17AWrjsROiCDxVe3X74", "placeName": "Swami Vivekananda Road" },
            { "lat": 12.9755162, "lon": 77.6066919, "placeId": "ChIJvwy9o30WrjsR_3Soez0XLL8", "placeName": "Mahatma Gandhi Road" },
            { "lat": 12.9809008, "lon": 77.59746539999999, "placeId": "ChIJdUZ_eWUWrjsRfo6CcEaixkU", "placeName": "Cubbon Park" }
        ]
    },
    {
        id: 'misc',
        name: 'Misc Locations',
        color: 'bg-orange-500',
        center: { lat: 12.9577, lon: 77.5992 },
        locations: [
            { "lat": 12.9351929, "lon": 77.62448069999999, "placeId": "ChIJLfyY2E4UrjsRVq4AjI7zgRY", "placeName": "Koramangala" },
            { "lat": 12.9577549, "lon": 77.5992505, "placeId": "ChIJ52kcAs4VrjsROc2UmPe_ifU", "placeName": "Shanti Nagar" },
            { "lat": 12.9638477, "lon": 77.5984758, "placeId": "ChIJyXSkPNcVrjsR9yIBVE-PCZo", "placeName": "Langford Gardens" }
        ]
    }
];

export default function Home() {
    const { wishlist } = useWishlist();
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMapMobile, setShowMapMobile] = useState(false);
    const [selectedCluster, setSelectedCluster] = useState<LocationCluster>(METRO_CLUSTERS[1]);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [selectedStations, setSelectedStations] = useState<string[]>([]); // For drill-down
    const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // State
    const [sortBy, setSortBy] = useState<string>('rent_asc');
    const [filters, setFilters] = useState({
        rentMin: 5000,
        rentMax: 50000,
        type: ['BHK2'],
        furnishing: [] as string[],
        propertySizeMin: 0,
        balconies: null as number | null,
        bathrooms: null as number | null,
        buildingType: [] as string[],
        amenities: [] as string[],
        withImagesOnly: false
    });

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    locations: JSON.stringify(selectedCluster.locations),
                    radius: '2.0',
                    type: filters.type.length > 0 ? filters.type.join(',') : 'BHK2,BHK1',
                    furnishing: filters.furnishing.length > 0 ? filters.furnishing.join(',') : ''
                });

                const res = await fetch(`/api/properties?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    const properties = (data.data || []) as Property[];

                    // Deduplicate by property ID (API returns duplicates across pages)
                    const seen = new Set<string>();
                    const uniqueProperties = properties.filter(p => {
                        if (seen.has(p.id)) {
                            return false;
                        }
                        seen.add(p.id);
                        return true;
                    });

                    console.log(`Fetched ${properties.length} properties, ${uniqueProperties.length} unique`);
                    setAllProperties(uniqueProperties);
                    setSelectedStations([]); // Reset station filter on cluster change
                } else {
                    console.error("Failed to fetch");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchData, 500);
        return () => clearTimeout(timeout);
    }, [filters.type, filters.furnishing, selectedCluster]); // Removed filters.rentMax - now client-side

    // Extract unique building types from all properties
    const availableBuildingTypes = useMemo(() => {
        const types = new Set(allProperties.map(p => p.buildingType).filter((t): t is string => Boolean(t)));
        return Array.from(types);
    }, [allProperties]);

    // Client-side filtering by all criteria
    const filteredProperties = useMemo(() => {
        let filtered = allProperties;

        // Filter by rent range (min and max)
        filtered = filtered.filter(prop => prop.rent > 0 && prop.rent >= filters.rentMin && prop.rent <= filters.rentMax);

        // Filter by property size
        if (filters.propertySizeMin > 0) {
            filtered = filtered.filter(prop => prop.propertySize >= filters.propertySizeMin);
        }

        // Filter by balconies
        if (filters.balconies !== null) {
            filtered = filtered.filter(prop => (prop.balconies || 0) >= filters.balconies!);
        }

        // Filter by bathrooms
        if (filters.bathrooms !== null) {
            filtered = filtered.filter(prop => (prop.bathroom || 0) >= filters.bathrooms!);
        }

        // Filter by only with images
        if (filters.withImagesOnly) {
            filtered = filtered.filter(prop => {
                const hasPhotos = prop.photos && prop.photos.length > 0;
                const hasOriginalImage = prop.originalImageUrl && prop.originalImageUrl.length > 0;
                return hasPhotos || hasOriginalImage;
            });
        }

        // Filter by building type
        if (filters.buildingType.length > 0) {
            filtered = filtered.filter(prop =>
                prop.buildingType && filters.buildingType.includes(prop.buildingType)
            );
        }

        // Filter by amenities (must have ALL selected amenities)
        if (filters.amenities.length > 0) {
            filtered = filtered.filter(prop => {
                if (!prop.amenitiesMap) return false;
                return filters.amenities.every(amenity => prop.amenitiesMap![amenity] === true);
            });
        }

        // Filter by selected stations
        if (selectedStations.length > 0) {
            filtered = filtered.filter(prop => {
                return selectedStations.some(stationName => {
                    const station = selectedCluster.locations.find(loc => loc.placeName === stationName);
                    if (!station) return false;

                    const latDiff = Math.abs(prop.latitude - station.lat);
                    const lonDiff = Math.abs(prop.longitude - station.lon);
                    const roughDistance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);

                    return roughDistance < 0.02;
                });
            });
        }

        // Filter by search query (locality or title)
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(prop =>
                prop.locality.toLowerCase().includes(lowerCaseQuery) ||
                prop.propertyTitle.toLowerCase().includes(lowerCaseQuery)
            );
        }

        // Sort based on sortBy
        switch (sortBy) {
            case 'rent_asc':
                filtered.sort((a, b) => a.rent - b.rent);
                break;
            case 'rent_desc':
                filtered.sort((a, b) => b.rent - a.rent);
                break;
            case 'size_desc':
                filtered.sort((a, b) => b.propertySize - a.propertySize);
                break;
            case 'size_asc':
                filtered.sort((a, b) => a.propertySize - b.propertySize);
                break;
            case 'lifestyle':
                filtered.sort((a, b) => (b.score?.lifestyle || 0) - (a.score?.lifestyle || 0));
                break;
            default:
                filtered.sort((a, b) => a.rent - b.rent);
        }

        return filtered;
    }, [allProperties, selectedStations, selectedCluster, filters, searchQuery, sortBy]);

    const toggleStation = (stationName: string) => {
        setSelectedStations(prev =>
            prev.includes(stationName)
                ? prev.filter(s => s !== stationName)
                : [...prev, stationName]
        );
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
            {/* Navbar */}
            <nav className="bg-white border-b px-6 py-4 flex items-center justify-between z-40 shadow-sm shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">NB</div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-purple-600">
                        NoBroker<span className="font-light text-gray-800">++</span>
                    </span>
                </div>

                {/* Cluster Selection */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {METRO_CLUSTERS.map(cluster => (
                        <button
                            key={cluster.id}
                            onClick={() => setSelectedCluster(cluster)}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${selectedCluster.id === cluster.id
                                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${cluster.color}`} />
                            {cluster.name}
                        </button>
                    ))}
                </div>

                {/* Wishlist Link */}
                <Link
                    href="/wishlist"
                    className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg font-semibold hover:bg-rose-100 transition-colors relative"
                >
                    <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-current' : ''}`} />
                    <span className="hidden md:inline">Wishlist</span>
                    {wishlist.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                            {wishlist.length}
                        </span>
                    )}
                </Link>
            </nav>

            {/* Filters */}
            <div className="shrink-0">
                <FilterBar filters={filters} setFilters={setFilters} availableBuildingTypes={availableBuildingTypes} sortBy={sortBy} setSortBy={setSortBy} />
            </div>

            {/* Station Drill-down */}
            <div className="bg-white border-b px-4 py-3 overflow-x-auto shrink-0">
                <div className="flex flex-col md:flex-row md:items-center gap-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 shrink-0">
                        <MapPinned className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Stations:</span>
                    </div>

                    <div className="flex flex-1 gap-2 flex-wrap min-w-0">
                        {selectedCluster.locations.map(loc => (
                            <button
                                key={loc.placeName}
                                onClick={() => toggleStation(loc.placeName)}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-all border whitespace-nowrap ${selectedStations.includes(loc.placeName)
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                    }`}
                            >
                                {loc.placeName}
                            </button>
                        ))}
                        {selectedStations.length > 0 && (
                            <button
                                onClick={() => setSelectedStations([])}
                                className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 underline"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Lazy search locality or title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-gray-50"
                        />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* List View (Scrollable) */}
                <div className={`w-full md:w-[60%] lg:w-[55%] h-full overflow-y-auto p-4 transition-all ${showMapMobile ? 'hidden md:block' : 'block'}`}>
                    <div className="max-w-3xl mx-auto space-y-4 pb-20">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                {loading ? <Loader2 className="animate-spin w-5 h-5 text-rose-500" /> : <Zap className="w-5 h-5 text-yellow-500 fill-current" />}
                                {loading ? 'Scanning Corridors...' : `${filteredProperties.length} Properties ${selectedStations.length > 0 ? 'Near Selected Stations' : 'Found'}`}
                            </h2>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-xl" />
                                ))}
                            </div>
                        ) : filteredProperties.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">No properties found matching your criteria.</div>
                        ) : (
                            filteredProperties.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedProperty(p)}
                                    onMouseEnter={() => setHoveredPropertyId(p.id)}
                                    onMouseLeave={() => setHoveredPropertyId(null)}
                                    className="cursor-pointer"
                                >
                                    <PropertyCard property={p} />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Map View (Fixed) */}
                <div className={`w-full md:w-[40%] lg:w-[45%] h-full hidden md:block bg-gray-200 border-l`}>
                    <Map key="desktop-map" properties={filteredProperties} center={{ ...selectedCluster.center, placeName: selectedCluster.name }} hoveredPropertyId={hoveredPropertyId} />
                </div>

                {/* Mobile Map Toggle */}
                {showMapMobile && (
                    <div className="md:hidden absolute inset-0 z-20 bg-white">
                        <Map key="mobile-map" properties={filteredProperties} center={{ ...selectedCluster.center, placeName: selectedCluster.name }} hoveredPropertyId={hoveredPropertyId} />
                    </div>
                )}

            </div>

            {/* Mobile Toggle Button */}
            <button
                onClick={() => setShowMapMobile(!showMapMobile)}
                className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 z-50 font-medium"
            >
                {showMapMobile ? <><List className="w-4 h-4" /> Show List</> : <><MapIcon className="w-4 h-4" /> Show Map</>}
            </button>

            {/* Detail Modal */}
            {selectedProperty && (
                <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
            )}

        </div>
    );
}
