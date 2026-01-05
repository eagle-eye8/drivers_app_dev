export type Point = {
  id: string;
  lat: number;
  lng: number;
};

export async function optimizeRoute(points: Point[]) {
  if (points.length <= 1) return points.map((p, i) => ({ ...p, index: i }));

  // 距離計算
  const distance = (a: Point, b: Point) => Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2));

  // 最も近い点から順に貪欲法で回る
  const visited: Point[] = [];
  const remaining = [...points];

  // スタート地点＝最も北（lat最大）の地点
  let current = remaining.sort((a, b) => b.lat - a.lat)[0];
  visited.push(current);
  remaining.splice(remaining.indexOf(current), 1);

  while (remaining.length) {
    let next = remaining[0];
    let minDist = distance(current, next);

    for (const p of remaining) {
      const d = distance(current, p);
      if (d < minDist) {
        next = p;
        minDist = d;
      }
    }

    visited.push(next);
    remaining.splice(remaining.indexOf(next), 1);
    current = next;
  }

  return visited.map((p, i) => ({ ...p, index: i }));
}
