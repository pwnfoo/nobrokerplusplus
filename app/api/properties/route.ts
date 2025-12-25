
import { NextResponse } from 'next/server';

const BASE_URL = "https://www.nobroker.in/api/v3/multi/property/RENT/filter";
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36';

async function fetchPage(queryParams: URLSearchParams, pageNo: number) {
  queryParams.set('pageNo', pageNo.toString());
  const apiUrl = `${BASE_URL}?${queryParams.toString()}`;

  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Basic Filters (removed rent - will filter client-side)
  const radius = searchParams.get('radius') || '2.0';
  const type = searchParams.get('type') || 'BHK2,BHK1,BHK3,BHK4PLUS';
  const furnishing = searchParams.get('furnishing') || '';

  let searchParamB64 = "";
  let localityString = "";

  // Check if a pre-constructed 'locations' JSON array is passed
  const locationsParam = searchParams.get('locations');

  if (locationsParam) {
    try {
      const locations = JSON.parse(locationsParam);
      const formattedLocations = locations.map((loc: any) => ({
        lat: loc.lat,
        lon: loc.lon,
        placeId: loc.placeId,
        placeName: loc.placeName,
        showMap: false
      }));

      searchParamB64 = btoa(JSON.stringify(formattedLocations));
      localityString = formattedLocations.map((l: any) => l.placeName).join(",");

    } catch (e) {
      console.error("Failed to parse locations param", e);
      return NextResponse.json({ error: 'Invalid locations parameter' }, { status: 400 });
    }
  } else {
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    if (!lat || !lon) {
      return NextResponse.json({ error: 'Locations or Lat/Lon required' }, { status: 400 });
    }
    const locPayload = [{
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      placeName: "Selected Location",
      showMap: false
    }];
    searchParamB64 = btoa(JSON.stringify(locPayload));
    localityString = "Selected Location";
  }

  const queryParams = new URLSearchParams({
    city: 'bangalore',
    isMetro: 'true',
    locality: localityString,
    pageNo: '1',
    radius: radius,
    searchParam: searchParamB64,
    sharedAccomodation: '0',
    type: type,
    ...(furnishing && { furnishing })
  });

  try {
    // Fetch first page to determine total pages
    const firstPageData = await fetchPage(queryParams, 1);
    const totalCount = firstPageData.otherParams?.total_count || 0;
    const perPage = firstPageData.data?.length || 26; // NoBroker typically returns 26 per page
    const totalPages = Math.ceil(totalCount / perPage);

    console.log(`Total properties: ${totalCount}, Pages: ${totalPages}`);

    // Collect all properties
    let allProperties = [...(firstPageData.data || [])];

    // Fetch remaining pages in parallel (limit to reasonable number to avoid overwhelming)
    if (totalPages > 1) {
      const maxPages = Math.min(totalPages, 20); // Limit to 20 pages (~520 properties) for safety
      const pagePromises = [];

      for (let page = 2; page <= maxPages; page++) {
        pagePromises.push(fetchPage(queryParams, page));
      }

      const remainingPages = await Promise.all(pagePromises);
      remainingPages.forEach(pageData => {
        if (pageData.data) {
          allProperties = allProperties.concat(pageData.data);
        }
      });
    }

    // Return aggregated result
    return NextResponse.json({
      ...firstPageData,
      data: allProperties,
      otherParams: {
        ...firstPageData.otherParams,
        fetched_count: allProperties.length,
        total_pages: totalPages
      }
    });

  } catch (error) {
    console.error("API Proxy Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
