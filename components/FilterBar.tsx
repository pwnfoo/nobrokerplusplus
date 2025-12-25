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
    const [isMobileOpen, setIsMobileOpen] = useState(false);

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
            {/* Main Filter Row */}
            <div className="px-3 md:px-4 py-3 max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">

                {/* Desktop/Tablet View - Primary Filters */}
                <div className="hidden lg:flex items-center gap-3">
                    {/* BHK Type */}
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

                    {/* Rent Range */}
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

                    {/* Furnishing */}
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
                </div>

                {/* Mobile/Small Screen View - Compact Triggers */}
                <div className="flex lg:hidden items-center gap-2 flex-1 min-w-0">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm transition-all border flex-1",
                            activeFiltersCount > 0 ? "bg-rose-600 text-white border-rose-600" : "bg-white text-slate-600 border-slate-200 shadow-sm"
                        )}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Filters</span>
                        {activeFiltersCount > 0 && (
                            <span className="bg-white text-rose-600 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-slate-200 shadow-sm">
                        <ArrowUpDown className="w-4 h-4 text-slate-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-sm font-bold bg-transparent text-slate-600 focus:outline-none cursor-pointer max-w-[80px]"
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Right Side Controls (Visible on Desktop) */}
                <div className="hidden lg:flex items-center gap-3">
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
                        <span>More</span>
                        <ChevronDown className={cn("w-4 h-4 transition-transform", showMore && "rotate-180")} />
                    </button>

                    {activeFiltersCount > 0 && (
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-1 px-2 py-2 text-sm text-slate-400 hover:text-rose-500 transition-colors font-medium"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Desktop More Filters Panel */}
            {showMore && (
                <div className="hidden lg:block px-4 py-6 border-t bg-slate-50/30 animate-in slide-in-from-top-2 duration-200">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex flex-wrap items-start gap-8">
                            {/* Building Type Panel Snippet */}
                            {availableBuildingTypes.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Building Type</span>
                                    <div className="flex gap-1.5 flex-wrap">
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
                                                            : "bg-white text-slate-600 border-slate-200"
                                                    )}
                                                >
                                                    {info.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Min Size Panel Snippet */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min Size</span>
                                <div className="flex items-center gap-2 bg-white rounded-md px-3 py-1.5 border border-slate-200">
                                    <Maximize2 className="w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        value={filters.propertySizeMin || ''}
                                        onChange={(e) => setFilters(prev => ({ ...prev, propertySizeMin: parseInt(e.target.value) || 0 }))}
                                        className="w-16 text-sm focus:outline-none bg-transparent font-medium"
                                        placeholder="Any"
                                    />
                                    <span className="text-[10px] text-slate-400 font-bold">SQFT</span>
                                </div>
                            </div>

                            {/* Balconies & Bathrooms */}
                            <div className="flex items-start gap-8">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balconies</span>
                                    <div className="flex gap-1">
                                        {[null, 1, 2, 3].map((num) => (
                                            <button key={num ?? 'any'} onClick={() => setFilters(prev => ({ ...prev, balconies: num }))} className={cn("px-3 py-1.5 text-xs font-medium rounded-md border", filters.balconies === num ? "bg-rose-600 text-white" : "bg-white")}>
                                                {num === null ? 'Any' : `${num}+`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bathrooms</span>
                                    <div className="flex gap-1">
                                        {[null, 1, 2, 3].map((num) => (
                                            <button key={num ?? 'any'} onClick={() => setFilters(prev => ({ ...prev, bathrooms: num }))} className={cn("px-3 py-1.5 text-xs font-medium rounded-md border", filters.bathrooms === num ? "bg-rose-600 text-white" : "bg-white")}>
                                                {num === null ? 'Any' : `${num}+`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amenities</span>
                            <div className="flex flex-wrap gap-2">
                                {AMENITIES.map(amenity => (
                                    <button key={amenity.id} onClick={() => toggleAmenity(amenity.id)} className={cn("px-3 py-1.5 text-xs font-medium rounded-md border", filters.amenities.includes(amenity.id) ? "bg-rose-600 text-white" : "bg-white")}>
                                        {amenity.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Filter Overlay/Drawer */}
            {isMobileOpen && (
                <div className="lg:hidden fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom-5 duration-300">
                    {/* Drawer Header */}
                    <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10 shadow-sm">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-black text-slate-900 leading-none">Filters</h3>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Refine your search</span>
                        </div>
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                            <ChevronDown className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">

                        {/* BHK Type Section */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Home className="w-3.5 h-3.5" />
                                Configuration
                            </span>
                            <div className="grid grid-cols-4 gap-2">
                                {BHK_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => toggleType(type.id)}
                                        className={cn(
                                            "py-3 text-xs font-bold rounded-xl border transition-all",
                                            filters.type.includes(type.id)
                                                ? "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-100"
                                                : "bg-white text-slate-600 border-slate-200"
                                        )}
                                    >
                                        {type.short}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rent Range Section */}
                        <div className="space-y-5">
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <IndianRupee className="w-3.5 h-3.5" />
                                Rent Range
                            </span>
                            <div className="space-y-6 px-2">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold text-slate-600">
                                        <span>Min: ₹{filters.rentMin.toLocaleString()}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="50000" step="5000"
                                        value={filters.rentMin}
                                        onChange={(e) => setFilters(prev => ({ ...prev, rentMin: parseInt(e.target.value) }))}
                                        className="w-full h-2 accent-rose-600 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold text-slate-600">
                                        <span>Max: ₹{filters.rentMax.toLocaleString()}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10000" max="100000" step="5000"
                                        value={filters.rentMax}
                                        onChange={(e) => setFilters(prev => ({ ...prev, rentMax: parseInt(e.target.value) }))}
                                        className="w-full h-2 accent-rose-600 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Furnishing Section */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Sofa className="w-3.5 h-3.5" />
                                Furnishing
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                                {FURNISHING_TYPES.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => toggleFurnishing(f.id)}
                                        className={cn(
                                            "py-3 text-[10px] font-bold rounded-xl border transition-all uppercase tracking-wider",
                                            filters.furnishing.includes(f.id)
                                                ? "bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-100"
                                                : "bg-white text-slate-600 border-slate-200"
                                        )}
                                    >
                                        {f.short}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Photos Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                                    <Sparkles className={cn("w-5 h-5", filters.withImagesOnly ? "text-rose-500 fill-current" : "text-slate-300")} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-700">Images Only</span>
                                    <span className="text-[10px] font-bold text-slate-400">Show only verified photos</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, withImagesOnly: !prev.withImagesOnly }))}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-all relative flex items-center px-1",
                                    filters.withImagesOnly ? "bg-rose-600" : "bg-slate-300"
                                )}
                            >
                                <div className={cn("w-4 h-4 bg-white rounded-full transition-transform shadow-sm", filters.withImagesOnly ? "translate-x-6" : "translate-x-0")} />
                            </button>
                        </div>

                        {/* Size & Balconies Grid */}
                        <div className="grid grid-cols-1 gap-6">
                            {/* Min Size Panel */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Maximize2 className="w-3.5 h-3.5" />
                                    Property Size
                                </span>
                                <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-200">
                                    <input
                                        type="number"
                                        value={filters.propertySizeMin || ''}
                                        onChange={(e) => setFilters(prev => ({ ...prev, propertySizeMin: parseInt(e.target.value) || 0 }))}
                                        className="flex-1 text-sm font-bold focus:outline-none"
                                        placeholder="Min size in SQFT"
                                    />
                                    <span className="text-[10px] font-black text-slate-400">SQFT</span>
                                </div>
                            </div>

                            {/* Balconies */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Building2 className="w-3.5 h-3.5" />
                                    Balconies
                                </span>
                                <div className="grid grid-cols-4 gap-2">
                                    {[null, 1, 2, 3].map((num) => (
                                        <button
                                            key={num ?? 'any'}
                                            onClick={() => setFilters(prev => ({ ...prev, balconies: num }))}
                                            className={cn("py-3 text-xs font-bold rounded-xl border", filters.balconies === num ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200")}
                                        >
                                            {num === null ? 'Any' : `${num}+`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Amenities</span>
                            <div className="flex flex-wrap gap-2">
                                {AMENITIES.map(amenity => (
                                    <button
                                        key={amenity.id}
                                        onClick={() => toggleAmenity(amenity.id)}
                                        className={cn(
                                            "px-4 py-2.5 text-xs font-bold rounded-xl border transition-all",
                                            filters.amenities.includes(amenity.id) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
                                        )}
                                    >
                                        {amenity.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Drawer Footer Buttons */}
                    <div className="sticky bottom-0 bg-white border-t p-6 flex gap-4 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
                        <button
                            onClick={resetFilters}
                            className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.15em] border border-slate-100 rounded-2xl"
                        >
                            Reset All
                        </button>
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="flex-[2] py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.15em] rounded-2xl shadow-xl shadow-slate-200"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
