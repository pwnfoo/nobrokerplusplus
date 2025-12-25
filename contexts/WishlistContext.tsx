
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property } from '@/types';

interface WishlistContextType {
    wishlist: Property[];
    addToWishlist: (property: Property) => void;
    removeFromWishlist: (propertyId: string) => void;
    isInWishlist: (propertyId: string) => boolean;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'nobroker_pp_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<Property[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
            if (stored) {
                setWishlist(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load wishlist:', error);
        }
        setIsHydrated(true);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (isHydrated) {
            try {
                localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
            } catch (error) {
                console.error('Failed to save wishlist:', error);
            }
        }
    }, [wishlist, isHydrated]);

    const addToWishlist = (property: Property) => {
        setWishlist(prev => {
            if (prev.some(p => p.id === property.id)) {
                return prev;
            }
            return [...prev, property];
        });
    };

    const removeFromWishlist = (propertyId: string) => {
        setWishlist(prev => prev.filter(p => p.id !== propertyId));
    };

    const isInWishlist = (propertyId: string) => {
        return wishlist.some(p => p.id === propertyId);
    };

    const clearWishlist = () => {
        setWishlist([]);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
