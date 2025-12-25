
export interface Property {
    id: string;
    propertyTitle: string;
    rent: number;
    deposit: number;
    propertySize: number;
    furnishingDesc: string;
    typeDesc: string;
    type: string;
    bathroom: number;
    furnishing: string;
    parkingDesc: string;
    latitude: number;
    longitude: number;
    originalImageUrl?: string;
    thumbnailImage?: string;
    photos: { imagesMap: { medium?: string; original?: string } }[];
    locality: string;
    propertyAge?: number;
    availableFrom?: number;
    score?: {
        lifestyle: number;
        transit: number;
    };
    ownerDescription?: string;
    amenitiesMap?: Record<string, boolean>;
    detailUrl?: string;
    buildingType?: string;
    totalFloor?: number;
    floor?: string;
    facing?: string;
    facingDesc?: string;
    balconies?: number;
    negotiable?: boolean;
    maintenanceAmount?: number;
}

export interface Coordinates {
    lat: number;
    lon: number;
    placeName: string;
    placeId?: string;
}

export interface LocationCluster {
    id: string;
    name: string;
    color: string;
    center: { lat: number, lon: number }; // For map centering
    locations: Coordinates[];
}
