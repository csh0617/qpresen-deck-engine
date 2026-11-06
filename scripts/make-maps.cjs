/* Build engine/assets/maps.ts from Natural Earth (public domain) GeoJSON:
   node scripts/make-maps.cjs <ne_10m_admin_1_states_provinces.geojson> <ne_110m_admin_0_countries.geojson>
   Output: window.QPMAPS = { kr: {…}, world: {…}, places: {…} } — Mercator-projected SVG path strings + the projection params,
   so runtime markers (lat/lng → x/y) land exactly on the same drawing. */
const fs = require('fs');
const [, , admin1File, countriesFile] = process.argv;
if (!admin1File || !countriesFile) { console.error('usage: make-maps <admin1.geojson> <countries.geojson>'); process.exit(1); }
const admin1 = JSON.parse(fs.readFileSync(admin1File, 'utf8'));
const countries = JSON.parse(fs.readFileSync(countriesFile, 'utf8'));

const rad = d => d * Math.PI / 180;
const merc = lat => Math.log(Math.tan(Math.PI / 4 + rad(Math.max(-85, Math.min(85, lat))) / 2));

function simplify(pts, tol) { // Douglas–Peucker on projected points
  if (pts.length < 5) return pts;
  const sq = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  const segDist = (p, a, b) => { const l2 = sq(a, b); if (!l2) return sq(p, a); let t = ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / l2; t = Math.max(0, Math.min(1, t)); return sq(p, [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]); };
  const keep = new Array(pts.length).fill(false); keep[0] = keep[pts.length - 1] = true;
  const stack = [[0, pts.length - 1]];
  while (stack.length) { const [s, e] = stack.pop(); let maxD = 0, idx = -1; for (let i = s + 1; i < e; i++) { const d = segDist(pts[i], pts[s], pts[e]); if (d > maxD) { maxD = d; idx = i; } } if (maxD > tol * tol && idx > 0) { keep[idx] = true; stack.push([s, idx], [idx, e]); } }
  return pts.filter((_, i) => keep[i]);
}
function ringArea(r) { let a = 0; for (let i = 0; i < r.length - 1; i++) a += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]; return Math.abs(a / 2); }

function build(features, { lonL, lonR, latT, latB, width, tol, minArea, idOf, nameOf, aliasesOf }) {
  const k = width / (rad(lonR) - rad(lonL)); const height = (merc(latT) - merc(latB)) * k;
  const proj = ([lon, lat]) => [(rad(lon) - rad(lonL)) * k, (merc(latT) - merc(lat)) * k];
  const regions = [];
  for (const f of features) {
    const g = f.geometry; if (!g) continue;
    const polys = g.type === 'MultiPolygon' ? g.coordinates : g.type === 'Polygon' ? [g.coordinates] : [];
    let d = ''; let cx = 0, cy = 0, aw = 0;
    for (const poly of polys) {
      const outer = poly[0].map(proj); const A = ringArea(outer); if (A < minArea) continue;
      for (const ring of poly) {
        const pts = simplify(ring.map(proj), tol); if (pts.length < 4) continue;
        d += 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
      }
      // area-weighted centroid of outer rings (for region labels)
      let sx = 0, sy = 0; for (const p of outer) { sx += p[0]; sy += p[1]; } cx += sx / outer.length * A; cy += sy / outer.length * A; aw += A;
    }
    if (!d) continue;
    regions.push({ id: idOf(f), name: nameOf(f), aliases: aliasesOf(f), d, c: [+(cx / aw).toFixed(1), +(cy / aw).toFixed(1)] });
  }
  return { w: +width.toFixed(1), h: +height.toFixed(1), proj: { lonL, latT, k: +k.toFixed(4) }, regions };
}

// --- Korea (17 시·도) ---
const KR_ALIAS = { 'KR-11': ['서울', '서울시'], 'KR-26': ['부산', '부산시'], 'KR-27': ['대구'], 'KR-28': ['인천'], 'KR-29': ['광주', '광주시'], 'KR-30': ['대전'], 'KR-31': ['울산'], 'KR-50': ['세종', '세종시'], 'KR-41': ['경기', '경기도'], 'KR-42': ['강원', '강원도', '강원특별자치도'], 'KR-43': ['충북', '충청북도'], 'KR-44': ['충남', '충청남도'], 'KR-45': ['전북', '전라북도', '전북특별자치도'], 'KR-46': ['전남', '전라남도'], 'KR-47': ['경북', '경상북도'], 'KR-48': ['경남', '경상남도'], 'KR-49': ['제주', '제주도', '제주특별자치도'] };
const krFeatures = admin1.features.filter(f => f.properties.adm0_a3 === 'KOR');
const kr = build(krFeatures, { lonL: 125.6, lonR: 130.2, latT: 38.65, latB: 33.05, width: 1000, tol: 0.9, minArea: 2.5,
  idOf: f => f.properties.iso_3166_2, nameOf: f => f.properties.name_ko || f.properties.name, aliasesOf: f => KR_ALIAS[f.properties.iso_3166_2] || [] });
// --- World (110m countries, Mercator, Antarctica dropped) ---
const worldFeatures = countries.features.filter(f => f.properties.ADM0_A3 !== 'ATA' && f.properties.NAME !== 'Antarctica');
const world = build(worldFeatures, { lonL: -170, lonR: 190, latT: 78, latB: -57, width: 2000, tol: 1.2, minArea: 6,
  idOf: f => f.properties.ISO_A3 && f.properties.ISO_A3 !== '-99' ? f.properties.ISO_A3 : f.properties.ADM0_A3, nameOf: f => f.properties.NAME_KO || f.properties.NAME, aliasesOf: f => [f.properties.NAME, f.properties.NAME_EN, f.properties.ABBREV].filter(Boolean) });

const places = {
  '서울': [37.5665, 126.978], '부산': [35.1796, 129.0756], '대구': [35.8714, 128.6014], '인천': [37.4563, 126.7052], '광주': [35.1595, 126.8526], '대전': [36.3504, 127.3845], '울산': [35.5384, 129.3114], '세종': [36.48, 127.289],
  '수원': [37.2636, 127.0286], '창원': [35.2281, 128.6811], '전주': [35.8242, 127.148], '청주': [36.6424, 127.489], '제주': [33.4996, 126.5312], '서귀포': [33.2541, 126.56], '강릉': [37.7519, 128.8761], '포항': [36.019, 129.3435], '여수': [34.7604, 127.6622], '목포': [34.8118, 126.3922], '순천': [34.9507, 127.4872], '광양': [34.9407, 127.6959], '나주': [35.0158, 126.7108],
  '천안': [36.8151, 127.1139], '춘천': [37.8813, 127.7298], '원주': [37.3422, 127.9202], '구미': [36.1195, 128.3446], '김해': [35.2285, 128.8894], '평택': [36.9921, 127.1129], '안산': [37.3219, 126.8309], '고양': [37.6584, 126.832], '용인': [37.2411, 127.1776], '성남': [37.4201, 127.1262], '화성': [37.1996, 126.8312], '파주': [37.7599, 126.78], '이천': [37.2722, 127.435],
  '군산': [35.9676, 126.7369], '익산': [35.9483, 126.9577], '거제': [34.8806, 128.6211], '통영': [34.8544, 128.433], '진주': [35.1803, 128.1076], '경주': [35.8562, 129.2247], '안동': [36.5684, 128.7294], '속초': [38.207, 128.5918], '동해': [37.5247, 129.1143], '삼척': [37.4499, 129.1651], '태백': [37.1641, 128.9856],
  '서산': [36.7845, 126.4503], '당진': [36.8896, 126.6459], '보령': [36.3334, 126.6128], '공주': [36.4465, 127.1192], '논산': [36.187, 127.0988], '아산': [36.7898, 127.0018], '영광': [35.2772, 126.512], '해남': [34.5736, 126.5989], '고창': [35.4358, 126.702], '정읍': [35.5699, 126.856], '남원': [35.4164, 127.3904], '김제': [35.8036, 126.8808],
  '무안': [34.9904, 126.4816], '함평': [35.0659, 126.5167], '장성': [35.3018, 126.7849], '담양': [35.3211, 126.9881], '화순': [35.0645, 126.9866], '곡성': [35.282, 127.2921], '구례': [35.2024, 127.4629], '보성': [34.7713, 127.08], '강진': [34.642, 126.7671], '장흥': [34.6816, 126.907], '완도': [34.311, 126.755], '진도': [34.4868, 126.2635], '신안': [34.8333, 126.3514], '영암': [34.8001, 126.6967], '고흥': [34.6112, 127.2851],
  '울릉': [37.4843, 130.9057], '독도': [37.2426, 131.8676], '평양': [39.0392, 125.7625], '개성': [37.9709, 126.5544], '새만금': [35.78, 126.6],
  '도쿄': [35.6762, 139.6503], '오사카': [34.6937, 135.5023], '후쿠오카': [33.5902, 130.4017], '베이징': [39.9042, 116.4074], '상하이': [31.2304, 121.4737], '선전': [22.5431, 114.0579], '광저우': [23.1291, 113.2644], '청두': [30.5728, 104.0668], '우한': [30.5928, 114.3055], '시안': [34.3416, 108.9398], '홍콩': [22.3193, 114.1694], '타이베이': [25.033, 121.5654], '신주': [24.8138, 120.9675],
  '싱가포르': [1.3521, 103.8198], '쿠알라룸푸르': [3.139, 101.6869], '방콕': [13.7563, 100.5018], '하노이': [21.0278, 105.8342], '호치민': [10.8231, 106.6297], '자카르타': [-6.2088, 106.8456], '마닐라': [14.5995, 120.9842], '뉴델리': [28.6139, 77.209], '뭄바이': [19.076, 72.8777], '벵갈루루': [12.9716, 77.5946], '시드니': [-33.8688, 151.2093], '멜버른': [-37.8136, 144.9631], '오클랜드': [-36.8485, 174.7633],
  '런던': [51.5074, -0.1278], '파리': [48.8566, 2.3522], '베를린': [52.52, 13.405], '뮌헨': [48.1351, 11.582], '드레스덴': [51.0504, 13.7373], '암스테르담': [52.3676, 4.9041], '아인트호벤': [51.4416, 5.4697], '브뤼셀': [50.8503, 4.3517], '취리히': [47.3769, 8.5417], '빈': [48.2082, 16.3738], '프라하': [50.0755, 14.4378], '바르샤바': [52.2297, 21.0122], '로마': [41.9028, 12.4964], '밀라노': [45.4642, 9.19], '마드리드': [40.4168, -3.7038], '바르셀로나': [41.3874, 2.1686], '리스본': [38.7223, -9.1393],
  '스톡홀름': [59.3293, 18.0686], '헬싱키': [60.1699, 24.9384], '오슬로': [59.9139, 10.7522], '코펜하겐': [55.6761, 12.5683], '더블린': [53.3498, -6.2603], '아테네': [37.9838, 23.7275], '이스탄불': [41.0082, 28.9784], '모스크바': [55.7558, 37.6173], '두바이': [25.2048, 55.2708], '아부다비': [24.4539, 54.3773], '리야드': [24.7136, 46.6753], '텔아비브': [32.0853, 34.7818], '카이로': [30.0444, 31.2357], '나이로비': [-1.2921, 36.8219], '요하네스버그': [-26.2041, 28.0473], '케이프타운': [-33.9249, 18.4241],
  '뉴욕': [40.7128, -74.006], '워싱턴': [38.9072, -77.0369], '보스턴': [42.3601, -71.0589], '시카고': [41.8781, -87.6298], '오스틴': [30.2672, -97.7431], '휴스턴': [29.7604, -95.3698], '덴버': [39.7392, -104.9903], '피닉스': [33.4484, -112.074], '샌프란시스코': [37.7749, -122.4194], '실리콘밸리': [37.3875, -122.0575], '로스앤젤레스': [34.0522, -118.2437], '시애틀': [47.6062, -122.3321], '포틀랜드': [45.5152, -122.6784], '라스베이거스': [36.1699, -115.1398],
  '토론토': [43.6532, -79.3832], '몬트리올': [45.5017, -73.5673], '밴쿠버': [49.2827, -123.1207], '멕시코시티': [19.4326, -99.1332], '상파울루': [-23.5505, -46.6333], '부에노스아이레스': [-34.6037, -58.3816], '산티아고': [-33.4489, -70.6693], '보고타': [4.711, -74.0721], '호놀룰루': [21.3069, -157.8583], '앵커리지': [61.2181, -149.9003],
};
const views = { kr: null, 'kr-south': { lonL: 125.9, lonR: 129.9, latT: 36.1, latB: 33.1 }, honam: { lonL: 125.8, lonR: 128.2, latT: 36.2, latB: 33.9 }, yeongnam: { lonL: 127.6, lonR: 130.2, latT: 37.3, latB: 34.4 }, sudogwon: { lonL: 126.2, lonR: 127.9, latT: 38.3, latB: 36.8 }, chungcheong: { lonL: 125.9, lonR: 128.8, latT: 37.3, latB: 35.7 }, gangwon: { lonL: 127.0, lonR: 129.6, latT: 38.7, latB: 37.0 }, jeju: { lonL: 126.0, lonR: 127.1, latT: 33.7, latB: 33.1 },
  world: null, eastasia: { lonL: 100, lonR: 150, latT: 50, latB: 18 }, asia: { lonL: 60, lonR: 150, latT: 56, latB: -12 }, europe: { lonL: -12, lonR: 42, latT: 71, latB: 34 }, america: { lonL: -130, lonR: -60, latT: 55, latB: 10 }, usa: { lonL: -126, lonR: -66, latT: 50, latB: 24 }, mideast: { lonL: 25, lonR: 65, latT: 42, latB: 12 }, oceania: { lonL: 110, lonR: 180, latT: -8, latB: -48 }, africa: { lonL: -20, lonR: 55, latT: 38, latB: -36 }, pacific: { lonL: 95, lonR: 190, latT: 62, latB: -48 } };

const out = `/* Generated by scripts/make-maps.cjs from Natural Earth (public domain). Do not edit by hand. */
export const MAPS_JS = ${JSON.stringify(`window.QPMAPS=${JSON.stringify({ kr, world, places, views })};`)};
`;
fs.writeFileSync('engine/assets/maps.ts', out);
console.log('kr regions', kr.regions.length, 'world regions', world.regions.length, 'bytes', out.length);
