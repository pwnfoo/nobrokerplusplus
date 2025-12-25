
'use client';

import React, { useState, useEffect } from 'react';
import { Property } from '@/types';
import {
    X, MapPin, Check, ExternalLink, Expand,
    Bus, Film, GraduationCap, ShoppingCart, Utensils, Building2, Pill, Train,
    Bed, Bath, Home, Sofa, Car, Calendar, IndianRupee, Ruler, Building, DoorOpen, Banknote
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import dynamic from 'next/dynamic';

// Dynamic import for mini map
const MiniMap = dynamic<{ lat: number; lon: number; title: string }>(() => import('./MiniMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg" />
});

interface NearbyPlace {
    name: string;
    distance: string;
    duration?: string;
    rating?: number;
    types: string[];
}

interface NearbyData {
    bus_station?: NearbyPlace[];
    movie_theater?: NearbyPlace[];
    school?: NearbyPlace[];
    super_market?: NearbyPlace[];
    restaurant?: NearbyPlace[];
    shopping_mall?: NearbyPlace[];
    pharmacy?: NearbyPlace[];
    train_station?: NearbyPlace[];
}

const NEARBY_CATEGORIES = [
    { key: 'bus_station', label: 'Bus Stations', icon: Bus, color: 'text-blue-600 bg-blue-50' },
    { key: 'train_station', label: 'Metro/Train', icon: Train, color: 'text-purple-600 bg-purple-50' },
    { key: 'school', label: 'Schools', icon: GraduationCap, color: 'text-amber-600 bg-amber-50' },
    { key: 'super_market', label: 'Supermarkets', icon: ShoppingCart, color: 'text-green-600 bg-green-50' },
    { key: 'restaurant', label: 'Restaurants', icon: Utensils, color: 'text-rose-600 bg-rose-50' },
    { key: 'movie_theater', label: 'Cinemas', icon: Film, color: 'text-pink-600 bg-pink-50' },
    { key: 'shopping_mall', label: 'Malls', icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
    { key: 'pharmacy', label: 'Pharmacies', icon: Pill, color: 'text-teal-600 bg-teal-50' },
];

interface PropertyModalProps {
    property: Property;
    onClose: () => void;
}

export function PropertyModal({ property, onClose }: PropertyModalProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [nearbyData, setNearbyData] = useState<NearbyData | null>(null);
    const [nearbyLoading, setNearbyLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'details' | 'nearby' | 'map'>('details');

    // Handle escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !lightboxOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, lightboxOpen]);

    // Fetch nearby places
    useEffect(() => {
        const fetchNearby = async () => {
            try {
                const res = await fetch(`/api/nearby?propertyId=${property.id}`);
                if (res.ok) {
                    const json = await res.json();
                    setNearbyData(json.data || {});
                }
            } catch (err) {
                console.error('Failed to fetch nearby:', err);
            } finally {
                setNearbyLoading(false);
            }
        };
        fetchNearby();
    }, [property.id]);

    if (!property) return null;

    // Construct all image URLs properly
    const images = property.photos.map(p => {
        const filename = p.imagesMap.original || p.imagesMap.medium || '';
        if (filename && !filename.startsWith('http')) {
            return `https://images.nobroker.in/images/${property.id}/${filename}`;
        }
        return filename.startsWith('//') ? `https:${filename}` : filename;
    }).filter(Boolean);

    // Fallback if no photos
    if (images.length === 0 && property.originalImageUrl) {
        const url = property.originalImageUrl;
        images.push(url.startsWith('//') ? `https:${url}` : url);
    }

    // Format for lightbox
    const lightboxSlides = images.map(src => ({ src }));

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    // Property quick stats
    const quickStats = [
        { icon: Bed, label: 'Bedrooms', value: property.typeDesc || '-' },
        { icon: Bath, label: 'Bathrooms', value: property.bathroom || '-' },
        { icon: Ruler, label: 'Area', value: `${property.propertySize} sqft` },
        { icon: Building, label: 'Floor', value: property.floor || '-' },
        { icon: Sofa, label: 'Furnishing', value: property.furnishingDesc || '-' },
        { icon: Car, label: 'Parking', value: property.parkingDesc || '-' },
        { icon: Home, label: 'Building', value: property.buildingType || '-' },
        { icon: DoorOpen, label: 'Facing', value: property.facing || '-' },
    ];

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">

                    {/* Header */}
                    <div className="border-b px-4 md:px-6 py-4 flex justify-between items-center bg-gradient-to-r from-rose-50 to-purple-50 shrink-0">
                        <div className="min-w-0 pr-2">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 truncate">{property.propertyTitle}</h2>
                            <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1 truncate">
                                <MapPin className="w-3.5 h-3.5 md:w-4 h-4" /> {property.locality}
                            </span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/80 rounded-full transition-colors shrink-0">
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b bg-gray-50 shrink-0">
                        {[
                            { id: 'details', label: 'Property Details' },
                            { id: 'nearby', label: 'Nearby Places' },
                            { id: 'map', label: 'Location Map' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === tab.id
                                    ? 'text-rose-600 border-b-2 border-rose-600 bg-white'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin">

                        {/* Details Tab */}
                        {activeTab === 'details' && (
                            <div className="p-6">
                                {/* Image Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 h-48 md:h-64">
                                    {images.slice(0, 4).map((img, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => openLightbox(idx)}
                                            className={`relative rounded-lg overflow-hidden cursor-pointer group ${idx === 0 ? 'col-span-2 row-span-1 md:row-span-2' : ''}`}
                                        >
                                            <Image src={img} alt={`View ${idx}`} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <Expand className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            {idx === 3 && images.length > 4 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm md:text-base">+{images.length - 4} more</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Price Banner */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl text-white">
                                    <div className="col-span-2 md:col-span-1">
                                        <span className="text-[10px] md:text-xs uppercase opacity-80 font-bold tracking-wider">Monthly Rent</span>
                                        <div className="text-2xl md:text-3xl font-black flex items-center gap-1">
                                            <IndianRupee className="w-5 h-5 md:w-6 h-6" />
                                            {property.rent.toLocaleString()}
                                            {property.negotiable && <span className="ml-2 text-[10px] bg-white text-rose-600 px-2 py-0.5 rounded-full font-black uppercase">Negotiable</span>}
                                        </div>
                                        {property.maintenanceAmount && property.maintenanceAmount > 0 && (
                                            <span className="text-[11px] opacity-90 font-bold block mt-0.5">+ ₹{property.maintenanceAmount.toLocaleString()} Maintenance</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-[10px] md:text-xs uppercase opacity-80 font-bold tracking-wider">Deposit</span>
                                        <div className="text-xl md:text-2xl font-bold flex items-center gap-1">
                                            <Banknote className="w-4 h-4 md:w-5 h-5 opacity-80" />
                                            {formatCurrency(property.deposit)}
                                        </div>
                                    </div>
                                    {property.availableFrom && (
                                        <div className="hidden md:block">
                                            <span className="text-[10px] md:text-xs uppercase opacity-80 font-bold tracking-wider">Available</span>
                                            <div className="text-xl font-bold flex items-center gap-2">
                                                <Calendar className="w-5 h-5 opacity-80" />
                                                {new Date(property.availableFrom).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                    {quickStats.map((stat, idx) => (
                                        <div key={idx} className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100 hover:border-rose-100 hover:bg-rose-50/20 transition-all group">
                                            <stat.icon className="w-5 h-5 mx-auto mb-2 text-slate-400 group-hover:text-rose-500 transition-colors" />
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">{stat.label}</div>
                                            <div className="text-sm font-black text-slate-700 truncate">{stat.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Scores */}
                                {property.score && (
                                    <div className="flex gap-4 mb-6">
                                        {property.score.lifestyle > 0 && (
                                            <div className="flex-1 bg-green-50 border border-green-100 p-4 rounded-xl">
                                                <div className="text-xs font-bold text-green-600 uppercase">Lifestyle Score</div>
                                                <div className="text-2xl font-black text-green-700">{property.score.lifestyle.toFixed(1)}<span className="text-sm font-normal">/10</span></div>
                                            </div>
                                        )}
                                        {property.score.transit > 0 && (
                                            <div className="flex-1 bg-purple-50 border border-purple-100 p-4 rounded-xl">
                                                <div className="text-xs font-bold text-purple-600 uppercase">Transit Score</div>
                                                <div className="text-2xl font-black text-purple-700">{property.score.transit.toFixed(1)}<span className="text-sm font-normal">/10</span></div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Description */}
                                {property.ownerDescription && (
                                    <div className="mb-6">
                                        <h3 className="text-base md:text-lg font-black text-slate-900 mb-2 uppercase tracking-wide">Owner Description</h3>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm border-l-4 border-rose-100 pl-4 py-1 italic">
                                            {property.ownerDescription}
                                        </p>
                                    </div>
                                )}

                                {/* Amenities */}
                                {property.amenitiesMap && Object.keys(property.amenitiesMap).length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold mb-3">Amenities</h3>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {Object.entries(property.amenitiesMap)
                                                .filter(([_, active]) => active)
                                                .map(([key]) => (
                                                    <div key={key} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                                                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                                                        <span className="capitalize text-sm text-gray-700 truncate">{key.replace(/_/g, ' ').toLowerCase()}</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button className="flex-[2] bg-slate-900 text-white font-black py-4 px-6 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-[0.15em] text-xs">
                                        Get Owner Details
                                    </button>
                                    <a
                                        href={`https://www.nobroker.in${property.detailUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-600 font-black py-4 px-6 rounded-2xl border border-slate-200 hover:border-rose-200 hover:text-rose-600 transition-all uppercase tracking-[0.1em] text-xs"
                                    >
                                        NoBroker <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Nearby Tab */}
                        {activeTab === 'nearby' && (
                            <div className="p-6">
                                {nearbyLoading ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />
                                        ))}
                                    </div>
                                ) : nearbyData ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {NEARBY_CATEGORIES.map(cat => {
                                            const places = nearbyData[cat.key as keyof NearbyData];
                                            if (!places || places.length === 0) return null;

                                            return (
                                                <div key={cat.key} className="border rounded-xl overflow-hidden">
                                                    <div className={`p-3 flex items-center gap-2 ${cat.color}`}>
                                                        <cat.icon className="w-5 h-5" />
                                                        <span className="font-semibold">{cat.label}</span>
                                                        <span className="ml-auto text-xs opacity-70">{places.length} nearby</span>
                                                    </div>
                                                    <div className="divide-y max-h-48 overflow-y-auto">
                                                        {places.slice(0, 5).map((place, idx) => (
                                                            <div key={idx} className="p-3 flex justify-between items-center text-sm">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-medium text-gray-800 truncate">{place.name}</div>
                                                                    {place.rating && (
                                                                        <span className="text-xs text-yellow-600">★ {place.rating}</span>
                                                                    )}
                                                                </div>
                                                                <div className="text-right shrink-0 ml-2">
                                                                    <div className="text-gray-600">{place.distance}</div>
                                                                    {place.duration && (
                                                                        <div className="text-xs text-gray-400">{place.duration}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-500">No nearby places data available.</div>
                                )}
                            </div>
                        )}

                        {/* Map Tab */}
                        {activeTab === 'map' && (
                            <div className="h-[500px]">
                                <MiniMap
                                    lat={property.latitude}
                                    lon={property.longitude}
                                    title={property.propertyTitle}
                                />
                            </div>
                        )}

                    </div>

                    {/* Footer */}
                    <div className="border-t px-6 py-3 bg-gray-50 text-xs text-gray-400 text-center shrink-0">
                        Property ID: {property.id}
                    </div>
                </div>
            </div>

            {/* Lightbox Gallery */}
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={lightboxSlides}
                index={lightboxIndex}
            />
        </>
    );
}
