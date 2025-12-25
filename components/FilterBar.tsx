'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    Home, IndianRupee, Sofa, Maximize2, Building2,
    ChevronDown, ArrowUpDown, Sparkles, SlidersHorizontal,
    RotateCcw
} from 'lucide-react';

interface FilterState {
    rentMin: number;
    rentMax: number;
    type: string[];
    furnishing: string[];
    propertySizeMin: number;
    balconies: number | null;
    bathrooms: number | null;
    buildingType: string[];
    amenities: string[];
    withImagesOnly: boolean;
}

interface FilterBarProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    availableBuildingTypes: string[];
    sortBy: string;
    setSortBy: (sort: string) => void;
    className?: string;
}

const SORT_OPTIONS = [
    { id: 'rent_asc', label: 'Rent ↑', fullLabel: 'Rent: Low to High' },
    { id: 'rent_desc', label: 'Rent ↓', fullLabel: 'Rent: High to Low' },
    { id: 'size_desc', label: 'Size ↓', fullLabel: 'Size: Large to Small' },
    { id: 'size_asc', label: 'Size ↑', fullLabel: 'Size: Small to Large' },
    { id: 'lifestyle', label: 'Score', fullLabel: 'Lifestyle Score' },
];

const BHK_TYPES = [
    { id: 'BHK1', label: '1 BHK', short: '1B' },
    { id: 'BHK2', label: '2 BHK', short: '2B' },
    { id: 'BHK3', label: '3 BHK', short: '3B' },
    { id: 'BHK4', label: '4 BHK+', short: '4B+' },
];

const FURNISHING_TYPES = [
    { id: 'FULLY_FURNISHED', label: 'Fully Furnished', short: 'Full' },
    { id: 'SEMI_FURNISHED', label: 'Semi Furnished', short: 'Semi' },
    { id: 'UNFURNISHED', label: 'Unfurnished', short: 'None' },
];

const AMENITIES = [
    { id: 'GYM', label: 'Gym' },
    { id: 'POOL', label: 'Pool' },
    { id: 'LIFT', label: 'Lift' },
    { id: 'SECURITY', label: '24x7 Security' },
    { id: 'PARK', label: 'Park' },
    { id: 'AC', label: 'AC' },
    { id: 'INTERNET', label: 'WiFi' },
    { id: 'CLUB', label: 'Clubhouse' },
];

const BUILDING_TYPE_LABELS: Record<string, { label: string }> = {
    'AP': { label: 'Apartment' },
    'IH': { label: 'House' },
    'IF': { label: 'Floor' },
    'GC': { label: 'Gated' },
};

export function FilterBar({ filters, setFilters, availableBuildingTypes, sortBy, setSortBy, className }: FilterBarProps) {
    const [showMore, setShowMore] = useState(false);

    const toggleType = (id: string) => {
        setFilters(prev => ({
            ...prev,
            type: prev.type.includes(id) ? prev.type.filter(t => t !== id) : [...prev.type, id]
        }));
    };

    const toggleFurnishing = (id: string) => {
        setFilters(prev => ({
            ...prev,
            furnishing: prev.furnishing.includes(id) ? prev.furnishing.filter(f => f !== id) : [...prev.furnishing, id]
        }));
    };

    const toggleBuildingType = (id: string) => {
        setFilters(prev => ({
            ...prev,
            buildingType: prev.buildingType.includes(id) ? prev.buildingType.filter(b => b !== id) : [...prev.buildingType, id]
        }));
    };

    const toggleAmenity = (id: string) => {
        setFilters(prev => ({
            ...prev,
            amenities: prev.amenities.includes(id) ? prev.amenities.filter(a => a !== id) : [...prev.amenities, id]
        }));
    };

    const resetFilters = () => {
        setFilters({
            rentMin: 5000,
            rentMax: 50000,
            type: ['BHK2'],
            furnishing: [],
            propertySizeMin: 0,
            balconies: null,
            bathrooms: null,
            buildingType: [],
            amenities: [],
            withImagesOnly: false
        });
        setSortBy('rent_asc');
    };

    const activeFiltersCount =
        filters.furnishing.length +
        filters.buildingType.length +
        filters.amenities.length +
        (filters.propertySizeMin > 0 ? 1 : 0) +
        (filters.balconies !== null ? 1 : 0) +
        (filters.bathrooms !== null ? 1 : 0) +
        (filters.withImagesOnly ? 1 : 0);

    return (
        <div className={cn("bg-white border-b sticky top-0 z-30 shadow-sm", className)}>
            {/* Main Filter Row - Always Visible */}
            <div className="px-4 py-3 max-w-7xl mx-auto">
                <div className="flex flex-wrap items-center gap-3">

                    {/* BHK Type - Primary Filter */}
                    <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200">
                        <Home className="w-4 h-4 text-slate-400 ml-2" />
                        {BHK_TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => toggleType(type.id)}
                                className={cn(
                                    "px-3 py-1.5 text-sm font-semibold rounded-md transition-all",
                                    filters.type.includes(type.id)
                                        ? "bg-rose-600 text-white shadow-sm"
                                        : "text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                {type.short}
                            </button>
                        ))}
                    </div>

                    {/* Rent Range - Compact */}
                    <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-slate-200">
                        <IndianRupee className="w-4 h-4 text-slate-400" />
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="0"
                                max="50000"
                                step="5000"
                                value={filters.rentMin}
                                onChange={(e) => setFilters(prev => ({ ...prev, rentMin: parseInt(e.target.value) }))}
                                className="w-16 h-1.5 accent-rose-600 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-600 w-8">{filters.rentMin / 1000}k</span>
                        </div>
                        <span className="text-slate-200">|</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="10000"
                                max="100000"
                                step="5000"
                                value={filters.rentMax}
                                onChange={(e) => setFilters(prev => ({ ...prev, rentMax: parseInt(e.target.value) }))}
                                className="w-16 h-1.5 accent-rose-600 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-600 w-10">{filters.rentMax / 1000}k</span>
                        </div>
                    </div>

                    {/* Furnishing - Pills */}
                    <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200">
                        <Sofa className="w-4 h-4 text-slate-400 ml-2" />
                        {FURNISHING_TYPES.map(f => (
                            <button
                                key={f.id}
                                onClick={() => toggleFurnishing(f.id)}
                                className={cn(
                                    "px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all",
                                    filters.furnishing.includes(f.id)
                                        ? "bg-rose-600 text-white shadow-sm"
                                        : "text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                {f.short}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-slate-200">
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-xs font-semibold bg-transparent text-slate-600 focus:outline-none cursor-pointer"
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.fullLabel}</option>
                            ))}
                        </select>
                    </div>

                    {/* Only with Images Toggle */}
                    <button
                        onClick={() => setFilters(prev => ({ ...prev, withImagesOnly: !prev.withImagesOnly }))}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs transition-all border",
                            filters.withImagesOnly
                                ? "bg-rose-50 text-rose-600 border-rose-200 shadow-sm"
                                : "bg-white text-slate-500 border-slate-200 hover:border-rose-200"
                        )}
                    >
                        <Sparkles className={cn("w-3.5 h-3.5", filters.withImagesOnly ? "text-rose-500 fill-current" : "text-slate-400")} />
                        Images Only
                    </button>

                    {/* More Filters Toggle */}
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all border",
                            showMore || activeFiltersCount > 0
                                ? "bg-rose-600 text-white border-rose-600"
                                : "bg-white text-slate-600 border-slate-200 hover:border-rose-200 hover:text-rose-600"
                        )}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        More
                        {activeFiltersCount > 0 && (
                            <span className="bg-white text-rose-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                {activeFiltersCount}
                            </span>
                        )}
                        <ChevronDown className={cn("w-4 h-4 transition-transform", showMore && "rotate-180")} />
                    </button>

                    {/* Reset */}
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-1 px-3 py-2 text-sm text-slate-400 hover:text-rose-500 transition-colors font-medium"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded Filters */}
            {showMore && (
                <div className="px-4 py-6 border-t bg-slate-50/30 animate-in slide-in-from-top-2 duration-200">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Building Type, Size, Balconies, Bathrooms Row */}
                        <div className="flex flex-wrap items-start gap-8">
                            {/* Building Type */}
                            {availableBuildingTypes.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Building Type</span>
                                    <div className="flex gap-1.5">
                                        {availableBuildingTypes.map(type => {
                                            const info = BUILDING_TYPE_LABELS[type] || { label: type };
                                            return (
                                                <button
                                                    key={type}
                                                    onClick={() => toggleBuildingType(type)}
                                                    className={cn(
                                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all border",
                                                        filters.buildingType.includes(type)
                                                            ? "bg-rose-600 text-white border-rose-600"
                                                            : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600"
                                                    )}
                                                >
                                                    {info.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Min Size */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min Size</span>
                                <div className="flex items-center gap-2 bg-white rounded-md px-3 py-1.5 border border-slate-200 focus-within:ring-1 focus-within:ring-rose-500 focus-within:border-rose-500 transition-all">
                                    <Maximize2 className="w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        min="0"
                                        max="5000"
                                        step="100"
                                        value={filters.propertySizeMin || ''}
                                        onChange={(e) => setFilters(prev => ({ ...prev, propertySizeMin: parseInt(e.target.value) || 0 }))}
                                        className="w-16 text-sm focus:outline-none bg-transparent font-medium text-slate-700"
                                        placeholder="Any"
                                    />
                                    <span className="text-[10px] text-slate-400 font-bold">SQFT</span>
                                </div>
                            </div>

                            {/* Balconies */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balconies</span>
                                <div className="flex gap-1.5">
                                    {[null, 1, 2, 3].map((num) => (
                                        <button
                                            key={num ?? 'any'}
                                            onClick={() => setFilters(prev => ({ ...prev, balconies: num }))}
                                            className={cn(
                                                "px-3 py-1.5 text-xs font-medium rounded-md transition-all border",
                                                filters.balconies === num
                                                    ? "bg-rose-600 text-white border-rose-600"
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600"
                                            )}
                                        >
                                            {num === null ? 'Any' : `${num}+`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bathrooms */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bathrooms</span>
                                <div className="flex gap-1.5">
                                    {[null, 1, 2, 3].map((num) => (
                                        <button
                                            key={num ?? 'any'}
                                            onClick={() => setFilters(prev => ({ ...prev, bathrooms: num }))}
                                            className={cn(
                                                "px-3 py-1.5 text-xs font-medium rounded-md transition-all border",
                                                filters.bathrooms === num
                                                    ? "bg-rose-600 text-white border-rose-600"
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600"
                                            )}
                                        >
                                            {num === null ? 'Any' : `${num}+`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amenities</span>
                            <div className="flex flex-wrap gap-2">
                                {AMENITIES.map(amenity => (
                                    <button
                                        key={amenity.id}
                                        onClick={() => toggleAmenity(amenity.id)}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all border",
                                            filters.amenities.includes(amenity.id)
                                                ? "bg-rose-600 text-white border-rose-600"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600"
                                        )}
                                    >
                                        {amenity.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
