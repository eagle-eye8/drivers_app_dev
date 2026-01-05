// lib/tsp.ts
export type Point = {
  lat: number;
  lng: number;
  label?: string; // 表示名
};

// 距離計算（Haversine）
const distance = (a: Point, b: Point) => {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * R * Math.asin(Math.sqrt(h));
};

// --------------------------------------------
// TSP解（全探索 + 枝刈り）
// --------------------------------------------

export function solveTSP(points: Point[]): Point[] {
  if (points.length <= 1) return points;

  let bestOrder: Point[] = [];
  let bestDist = Infinity;

  const used = Array(points.length).fill(false);
  const order: Point[] = [];

  const dfs = (depth: number, currDist: number) => {
    if (currDist >= bestDist) return; // 枝刈り

    if (depth === points.length) {
      bestDist = currDist;
      bestOrder = [...order];
      return;
    }

    for (let i = 0; i < points.length; i++) {
      if (used[i]) continue;

      used[i] = true;

      if (depth === 0) {
        order[depth] = points[i];
        dfs(depth + 1, 0);
      } else {
        const d = distance(order[depth - 1], points[i]);
        order[depth] = points[i];
        dfs(depth + 1, currDist + d);
      }

      used[i] = false;
    }
  };

  dfs(0, 0);

  return bestOrder;
}

export function makeGoogleMapRoute(points: Point[]): string {
  if (points.length < 2) return "";

  const origin = `${points[0].lat},${points[0].lng}`;
  const destination = `${points[points.length - 1].lat},${points[points.length - 1].lng}`;

  const waypoints = points
    .slice(1, -1)
    .map((p) => `${p.lat},${p.lng}`)
    .join("|");

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;
}
