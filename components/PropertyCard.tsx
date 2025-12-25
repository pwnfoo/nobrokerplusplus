'use client';

import React, { useState, useEffect } from 'react';
import { Property } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Bath, Maximize, MapPin, ExternalLink, ThumbsUp, Sofa, Heart, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useWishlist } from '@/contexts/WishlistContext';

export function PropertyCard({ property }: { property: Property }) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const inWishlist = isInWishlist(property.id);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Get all image URLs
    const getImageUrls = () => {
        const urls: string[] = [];
        if (property.photos && property.photos.length > 0) {
            property.photos.forEach(photo => {
                const medium = photo.imagesMap?.medium;
                if (medium) {
                    if (medium.startsWith('http')) {
                        urls.push(medium);
                    } else {
                        urls.push(`https://images.nobroker.in/images/${property.id}/${medium}`);
                    }
                }
            });
        }
        if (urls.length === 0) {
            if (property.originalImageUrl) {
                urls.push(property.originalImageUrl.startsWith('//')
                    ? `https:${property.originalImageUrl}`
                    : property.originalImageUrl);
            } else {
                urls.push('https://assets.nobroker.in/static/img/534_notxt.jpg');
            }
        }
        return urls;
    };

    const imageUrls = getImageUrls();
    const hasMultipleImages = imageUrls.length > 1;

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev + 1) % imageUrls.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev - 1 + imageUrls.length) % imageUrls.length);
    };

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (inWishlist) {
            removeFromWishlist(property.id);
        } else {
            addToWishlist(property);
        }
    };

    return (
        <div className="group bg-white rounded-2xl border border-slate-100 hover:border-rose-400/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row h-auto md:min-h-[15rem]">

            {/* Image Section with Carousel */}
            <div className="relative w-full md:w-72 h-52 md:h-auto shrink-0 overflow-hidden bg-slate-100">
                {/* Main Image */}
                <Image
                    src={imageUrls[currentImageIndex]}
                    alt={property.propertyTitle}
                    fill
                    className="object-cover transition-opacity duration-500"
                    unoptimized
                />

                {/* Subtle Overlays */}
                <div className="absolute inset-0 bg-black/5" />

                {/* Navigation Arrows - only show if multiple images */}
                {hasMultipleImages && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-105"
                            title="Previous image"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-700" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-105"
                            title="Next image"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-700" />
                        </button>

                        {/* Image Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                            {imageUrls.slice(0, 5).map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex
                                        ? 'bg-white scale-125'
                                        : 'bg-white/40'
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Lifestyle Score Badge */}
                {property.score?.lifestyle && (
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[10px] font-black px-2.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm border border-rose-100">
                        <Sparkles className="w-3 h-3 text-rose-500" />
                        <span className="text-slate-900 tracking-tight">{property.score.lifestyle.toFixed(1)} SCORE</span>
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistClick}
                    className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all transform hover:scale-110 ${inWishlist
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/95 text-slate-400 hover:text-rose-500'
                        }`}
                    title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                </button>

                {/* Image Count Badge */}
                {hasMultipleImages && (
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded font-bold backdrop-blur-sm">
                        {currentImageIndex + 1} / {imageUrls.length}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-5 flex flex-col justify-between overflow-hidden">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-slate-900 truncate text-xl group-hover:text-rose-600 transition-colors duration-300">
                                {property.propertyTitle}
                            </h3>
                            <div className="flex items-center text-slate-500 text-xs mt-1.5 font-medium">
                                <MapPin className="w-3.5 h-3.5 mr-1 text-rose-500" />
                                <span className="truncate">{property.locality}</span>
                            </div>
                        </div>
                        <span className="shrink-0 bg-rose-50 text-rose-600 text-[10px] px-2.5 py-1.5 rounded-md border border-rose-100 font-black uppercase tracking-widest">
                            {property.typeDesc}
                        </span>
                    </div>

                    {/* Price & Stats Grid - Tasteful brand colors */}
                    <div className="grid grid-cols-3 gap-2">
                        {/* Rent */}
                        <div className="bg-rose-50/30 rounded-xl p-2.5 border border-rose-100/50 group-hover:border-rose-200 transition-colors flex flex-col justify-center min-w-0">
                            <span className="text-[9px] text-rose-600 uppercase font-black tracking-widest truncate">Rent / Mo</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-lg font-black text-slate-900 whitespace-nowrap">{formatCurrency(property.rent)}</span>
                            </div>
                            {property.maintenanceAmount && property.maintenanceAmount > 0 && (
                                <span className="text-[8px] text-rose-400 font-bold uppercase tracking-tight truncate">+₹{property.maintenanceAmount} MAINT.</span>
                            )}
                        </div>

                        {/* Deposit */}
                        <div className="bg-amber-50/30 rounded-xl p-2.5 border border-amber-100/50 group-hover:border-amber-200 transition-colors flex flex-col justify-center min-w-0">
                            <span className="text-[9px] text-amber-600 uppercase font-black tracking-widest truncate">Deposit</span>
                            <div className="mt-0.5">
                                <span className="text-lg font-black text-slate-900 whitespace-nowrap">{formatCurrency(property.deposit)}</span>
                            </div>
                        </div>

                        {/* Size */}
                        <div className="bg-emerald-50/30 rounded-xl p-2.5 border border-emerald-100/50 group-hover:border-emerald-200 transition-colors flex flex-col justify-center min-w-0">
                            <span className="text-[9px] text-emerald-600 uppercase font-black tracking-widest truncate">Size</span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-lg font-black text-slate-900 whitespace-nowrap">{property.propertySize}</span>
                                <span className="text-[9px] text-slate-400 font-black tracking-tighter shrink-0">SQFT</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-5 text-xs">
                        <div className="flex items-center gap-2 text-slate-500 group/icon" title="Bathrooms">
                            <Bath className="w-4 h-4 text-slate-400 group-hover/icon:text-rose-500 transition-colors" />
                            <span className="font-bold text-slate-700">{property.bathroom}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 group/icon" title="Furnishing">
                            <Sofa className="w-4 h-4 text-slate-400 group-hover/icon:text-rose-500 transition-colors" />
                            <span className="font-bold text-slate-700 capitalize">{property.furnishingDesc?.toLowerCase()}</span>
                        </div>
                    </div>

                    <a
                        href={`https://www.nobroker.in${property.detailUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 text-rose-600 font-black text-xs hover:text-rose-700 transition-all uppercase tracking-widest"
                    >
                        <span>View on NoBroker</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>
        </div>
    );
}
