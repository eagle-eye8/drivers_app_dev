// lib/geocode.ts
export async function geocodeAddress(address: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.results || data.results.length === 0) return null;

  const loc = data.results[0].geometry.location;

  return {
    lat: loc.lat,
    lng: loc.lng,
  };
}
