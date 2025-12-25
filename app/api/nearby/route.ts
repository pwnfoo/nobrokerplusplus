'use server';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
        return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
    }

    try {
        const url = `https://www.nobroker.in/api/v3/property/${propertyId}/nearby`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'application/json',
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            console.error('NoBroker API error:', response.status);
            return NextResponse.json({ error: 'Failed to fetch nearby places' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Nearby API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
