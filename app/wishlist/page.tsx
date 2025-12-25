'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useWishlist } from '@/contexts/WishlistContext';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyModal } from '@/components/PropertyModal';
import { FilterBar } from '@/components/FilterBar';
import { Property } from '@/types';
import { Heart, ArrowLeft, Trash2, Map as MapIcon, List, MapPinned, FilterX } from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function WishlistPage() {
    const { wishlist, clearWishlist } = useWishlist();
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [showMapMobile, setShowMapMobile] = useState(false);
    const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);

    // State for filters and sorting
    const [sortBy, setSortBy] = useState<string>('rent_asc');
    const [filters, setFilters] = useState({
        rentMin: 0,
        rentMax: 200000,
        type: [] as string[],
        furnishing: [] as string[],
        propertySizeMin: 0,
        balconies: null as number | null,
        bathrooms: null as number | null,
        buildingType: [] as string[],
        amenities: [] as string[],
        withImagesOnly: false
    });

    // Extract unique building types from wishlist
    const availableBuildingTypes = useMemo(() => {
        const types = new Set(wishlist.map(p => p.buildingType).filter((t): t is string => Boolean(t)));
        return Array.from(types);
    }, [wishlist]);

    // Apply filtering and sorting
    const filteredWishlist = useMemo(() => {
        let filtered = [...wishlist];

        // Filter by rent range
        filtered = filtered.filter(prop => prop.rent >= filters.rentMin && prop.rent <= filters.rentMax);

        // Filter by BHK type if selected
        if (filters.type.length > 0) {
            filtered = filtered.filter(prop => filters.type.includes(prop.type));
        }

        // Filter by furnishing if selected
        if (filters.furnishing.length > 0) {
            filtered = filtered.filter(prop => filters.furnishing.includes(prop.furnishing));
        }

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

        // Filter by only with images (high quality: at least 3 images)
        if (filters.withImagesOnly) {
            filtered = filtered.filter(prop => (prop.photos?.length || 0) > 2);
        }

        // Filter by building type
        if (filters.buildingType.length > 0) {
            filtered = filtered.filter(prop =>
                prop.buildingType && filters.buildingType.includes(prop.buildingType)
            );
        }

        // Filter by amenities (must have ANY of the selected amenities)
        if (filters.amenities.length > 0) {
            filtered = filtered.filter(prop => {
                if (!prop.amenitiesMap) return false;
                return filters.amenities.some(amenity => prop.amenitiesMap![amenity] === true);
            });
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
                filtered.sort((a, b) => (b.propertySize || 0) - (a.propertySize || 0));
                break;
            case 'size_asc':
                filtered.sort((a, b) => (a.propertySize || 0) - (b.propertySize || 0));
                break;
        }

        return filtered;
    }, [wishlist, filters, sortBy]);

    // Calculate map center based on filtered wishlist
    const mapCenter = useMemo(() => {
        const source = filteredWishlist.length > 0 ? filteredWishlist : wishlist;
        if (source.length === 0) return { lat: 12.9716, lon: 77.5946, placeName: 'Bangalore' };

        const sum = source.reduce(
            (acc, prop) => ({
                lat: acc.lat + prop.latitude,
                lon: acc.lon + prop.longitude
            }),
            { lat: 0, lon: 0 }
        );

        return {
            lat: sum.lat / source.length,
            lon: sum.lon / source.length,
            placeName: 'Saved Properties'
        };
    }, [filteredWishlist, wishlist]);

    return (
        <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <nav className="bg-white border-b px-6 py-4 flex items-center justify-between z-40 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">NB</div>
                        <span className="text-lg font-bold text-rose-600">
                            NoBroker<span className="font-light text-slate-800">++</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-rose-600">
                        <Heart className="w-5 h-5 fill-current" />
                        <span className="font-semibold text-sm">{wishlist.length} Saved Items</span>
                    </div>
                    {wishlist.length > 0 && (
                        <button
                            onClick={clearWishlist}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors uppercase tracking-wider"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear All
                        </button>
                    )}
                </div>
            </nav>

            {/* Filter Bar */}
            {wishlist.length > 0 && (
                <FilterBar
                    filters={filters as any}
                    setFilters={setFilters as any}
                    availableBuildingTypes={availableBuildingTypes}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    className="z-30 shrink-0"
                />
            )}

            {/* Content Grid */}
            <div className={`flex-1 flex overflow-hidden relative ${showMapMobile ? 'flex-col lg:flex-row' : ''}`}>

                {/* List View */}
                <div className={`transition-all duration-300 ${wishlist.length > 0 ? (showMapMobile ? 'w-full lg:w-1/2 overflow-y-auto' : 'w-full overflow-y-auto') : 'w-full'}`}>
                    <div className="p-4 md:p-6 pb-24 max-w-5xl mx-auto">
                        <div className="flex items-baseline justify-between mb-6">
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <Heart className="w-7 h-7 text-rose-500 fill-current" />
                                Your Wishlist
                            </h1>
                            {wishlist.length > 0 && filteredWishlist.length !== wishlist.length && (
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Showing {filteredWishlist.length} of {wishlist.length}
                                </span>
                            )}
                        </div>

                        {wishlist.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
                                <MapPinned className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                                <h2 className="text-xl font-bold text-slate-500 mb-2">No saved properties yet</h2>
                                <p className="text-slate-400 mb-8 text-sm max-w-xs mx-auto">Shortlist properties to see them here and visualize them on the map!</p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 bg-rose-600 text-white font-black px-6 py-3 rounded-xl hover:bg-rose-700 transition-all shadow-lg hover:shadow-rose-200 uppercase tracking-widest text-xs"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Browse Properties
                                </Link>
                            </div>
                        ) : filteredWishlist.length === 0 ? (
                            <div className="text-center py-20 bg-white/50 rounded-3xl border border-slate-200 p-8">
                                <FilterX className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                                <h2 className="text-lg font-bold text-slate-600 mb-1">No matching saved properties</h2>
                                <p className="text-slate-400 text-xs mb-6">Try adjusting your filters to see more results.</p>
                                <button
                                    onClick={() => setFilters({
                                        rentMin: 0,
                                        rentMax: 500000,
                                        type: [],
                                        furnishing: [],
                                        propertySizeMin: 0,
                                        balconies: null,
                                        bathrooms: null,
                                        buildingType: [],
                                        amenities: [],
                                        withImagesOnly: false
                                    })}
                                    className="text-rose-600 font-bold text-xs uppercase tracking-widest hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {filteredWishlist.map(property => (
                                    <div
                                        key={property.id}
                                        onClick={() => setSelectedProperty(property)}
                                        onMouseEnter={() => setHoveredPropertyId(property.id)}
                                        onMouseLeave={() => setHoveredPropertyId(null)}
                                        className="cursor-pointer"
                                    >
                                        <PropertyCard property={property} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Map View */}
                {wishlist.length > 0 && showMapMobile && (
                    <div className="w-full lg:w-1/2 h-full bg-slate-100 border-l relative overflow-hidden">
                        <Map
                            properties={filteredWishlist}
                            center={mapCenter}
                            hoveredPropertyId={hoveredPropertyId}
                        />
                    </div>
                )}
            </div>

            {/* Floating Map Toggle (Consistency with Home) */}
            {wishlist.length > 0 && (
                <button
                    onClick={() => setShowMapMobile(!showMapMobile)}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 z-50 font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 border border-white/10"
                >
                    {showMapMobile ? <><List className="w-5 h-5 text-rose-400" /> Property List</> : <><MapIcon className="w-4 h-4 text-rose-400" /> Interaction Map</>}
                </button>
            )}

            {/* Detail Modal */}
            {selectedProperty && (
                <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
            )}
        </div>
    );
}
