/**
 * Google Maps Directions API client
 * Fetches route data: duration, distance, steps
 */
const DIRECTIONS_API = 'https://maps.googleapis.com/maps/api/directions/json';
const GEOCODE_API = 'https://maps.googleapis.com/maps/api/geocode/json';

function isLatLng(str) {
  return /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(String(str || '').trim());
}

async function geocodeAddress(addr) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || !addr?.trim()) return null;
  try {
    const params = new URLSearchParams({ address: addr.trim(), key: apiKey });
    const res = await fetch(`${GEOCODE_API}?${params}`);
    const data = await res.json();
    const loc = data.results?.[0]?.geometry?.location;
    if (loc) return `${loc.lat},${loc.lng}`;
  } catch (_) {}
  return null;
}

/** Reverse geocode lat,lng to a formatted address using Google Geocoding API */
export async function reverseGeocode(lat, lng) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('GOOGLE_MAPS_API_KEY not set in .env');
  }
  const params = new URLSearchParams({ latlng: `${lat},${lng}`, key: apiKey });
  const res = await fetch(`${GEOCODE_API}?${params}`);
  const data = await res.json();
  if (data.status !== 'OK' || !data.results?.[0]) {
    throw new Error(data.error_message || data.status || 'No address found');
  }
  return data.results[0].formatted_address;
}

function decodePolyline(encoded) {
  const points = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;
    shift = 0; result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

export async function getRoutePolyline(origin, destination, options = {}) {
  const { mode = 'driving', avoidHighways = false, avoidTolls = false } = options;
  const params = new URLSearchParams({
    origin,
    destination,
    mode: mode === 'transit' ? 'transit' : mode === 'walking' ? 'walking' : 'driving',
    alternatives: 'false',
    key: process.env.GOOGLE_MAPS_API_KEY || '',
  });
  const avoid = [];
  if (avoidHighways) avoid.push('highways');
  if (avoidTolls) avoid.push('tolls');
  if (avoid.length) params.set('avoid', avoid.join('|'));
  if (mode === 'driving') {
    params.set('departure_time', 'now');
    params.set('traffic_model', 'best_guess');
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('GOOGLE_MAPS_API_KEY not set in .env');
  }

  const res = await fetch(`${DIRECTIONS_API}?${params}`);
  const data = await res.json();

  if (data.status === 'ZERO_RESULTS' || !data.routes?.[0]) {
    if (!isLatLng(origin) || !isLatLng(destination)) {
      const [o, d] = await Promise.all([geocodeAddress(origin), geocodeAddress(destination)]);
      if (o && d) return getRoutePolyline(o, d, options);
    }
    return null;
  }
  if (data.status !== 'OK') {
    throw new Error(data.error_message || data.status || 'Directions API error');
  }

  const route = data.routes[0];
  const encoded = route.overview_polyline?.points;
  if (!encoded) return null;

  const points = decodePolyline(encoded);
  const leg = route.legs?.[0];
  return {
    points,
    start: leg?.start_location ? [leg.start_location.lat, leg.start_location.lng] : points[0],
    end: leg?.end_location ? [leg.end_location.lat, leg.end_location.lng] : points[points.length - 1],
  };
}

async function fetchDirections(origin, destination, { mode, avoidHighways, avoidTolls, alternatives, departureTime }) {
  const resolvedMode = mode === 'transit' ? 'transit' : mode === 'walking' ? 'walking' : 'driving';
  const params = new URLSearchParams({
    origin,
    destination,
    mode: resolvedMode,
    alternatives: alternatives ? 'true' : 'false',
    key: process.env.GOOGLE_MAPS_API_KEY,
  });
  // avoid (highways, tolls) only applies to driving - omit for walking/transit to avoid wrong results
  if (resolvedMode === 'driving') {
    const avoid = [];
    if (avoidHighways) avoid.push('highways');
    if (avoidTolls) avoid.push('tolls');
    if (avoid.length) params.set('avoid', avoid.join('|'));
  }
  if (resolvedMode === 'driving' && departureTime) {
    params.set('departure_time', departureTime);
    params.set('traffic_model', 'best_guess');
  }
  if (resolvedMode === 'transit') {
    params.set('departure_time', 'now');
  }

  const res = await fetch(`${DIRECTIONS_API}?${params}`);
  const data = await res.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(data.error_message || data.status || 'Directions API error');
  }
  return data.routes || [];
}

export async function getRoutes(origin, destination, options = {}) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('GOOGLE_MAPS_API_KEY not set in .env');
  }
  const { mode = 'driving', avoidHighways = false, avoidTolls = false } = options;

  let primary = await fetchDirections(origin, destination, {
    mode,
    avoidHighways,
    avoidTolls,
    alternatives: false,
    departureTime: mode === 'driving' ? 'now' : undefined,
  });
  if (!primary[0] && (!isLatLng(origin) || !isLatLng(destination))) {
    const o = isLatLng(origin) ? origin : await geocodeAddress(origin);
    const d = isLatLng(destination) ? destination : await geocodeAddress(destination);
    if (o && d) return getRoutes(o, d, options);
  }
  if (!primary[0]) return [];

  const r = primary[0];
  const leg = r.legs?.[0];
  const durationSeconds = mode === 'driving' && leg?.duration_in_traffic?.value != null
    ? leg.duration_in_traffic.value
    : leg?.duration?.value ?? null;

  const overviewEncoded = r.overview_polyline?.points;
  const points = overviewEncoded ? decodePolyline(overviewEncoded) : [];
  const start = leg?.start_location ? [leg.start_location.lat, leg.start_location.lng] : (points[0] || null);
  const end = leg?.end_location ? [leg.end_location.lat, leg.end_location.lng] : (points[points.length - 1] || null);

  const steps = (leg?.steps ?? []).map(s => ({
    instruction: s.html_instructions,
    duration: s.duration?.value,
    distance: s.distance?.value,
    distanceText: s.distance?.text,
    durationText: s.duration?.text,
    startLocation: s.start_location ? [s.start_location.lat, s.start_location.lng] : null,
    endLocation: s.end_location ? [s.end_location.lat, s.end_location.lng] : null,
    polylinePoints: s.polyline?.points ? decodePolyline(s.polyline.points) : [],
  }));

  return [{
    routeIndex: 0,
    durationSeconds,
    distanceMeters: leg?.distance?.value ?? null,
    points,
    start,
    end,
    steps,
    summary: r.summary ?? null,
  }];
}
