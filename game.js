const canvas = document.querySelector('#world');
const ctx = canvas.getContext('2d');
const speedLabel = document.querySelector('#speed');
const missionLabel = document.querySelector('#mission');
const locationLabel = document.querySelector('#location');
const { nodes, roads, buildings } = window.ALEY_ROADS;

// This deliberately focuses the first game district instead of showing every road in Aley.
const bounds = { north: 33.8148, south: 33.8070, east: 35.6105, west: 35.5990 };
const pad = 26;
const project = ([lat, lon]) => ({ x: pad + (lon - bounds.west) / (bounds.east - bounds.west) * (canvas.width - pad * 2), y: pad + (bounds.north - lat) / (bounds.north - bounds.south) * (canvas.height - pad * 2) });
const pointById = Object.fromEntries(Object.entries(nodes).map(([id, value]) => [id, project(value)]));
const visible = (p) => p && p.x > -90 && p.x < canvas.width + 90 && p.y > -90 && p.y < canvas.height + 90;
const style = {
  motorway: { edge: '#af7953', road: '#44484c', width: 31, lane: true }, primary: { edge: '#bb7b4e', road: '#454a4d', width: 27, lane: true },
  primary_link: { edge: '#bb7b4e', road: '#454a4d', width: 23, lane: true }, secondary: { edge: '#b7a46e', road: '#4b5053', width: 23, lane: true },
  tertiary: { edge: '#bfc2b8', road: '#575c5d', width: 19, lane: false }, residential: { edge: '#c6c8be', road: '#616566', width: 16, lane: false },
  unclassified: { edge: '#c6c8be', road: '#5d6162', width: 17, lane: false }, service: { edge: '#c0c8bc', road: '#696d6c', width: 12, lane: false },
};
const links = [];
for (const road of roads) for (let i = 1; i < road.p.length; i++) {
  const a = road.p[i - 1], b = road.p[i];
  if (pointById[a] && pointById[b]) links.push({ a, b, type: road.t });
}
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const drawPath = (context, points, width, colour, cap = 'butt') => { context.beginPath(); points.forEach((p, i) => i ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y)); context.lineWidth = width; context.lineCap = cap; context.lineJoin = 'round'; context.strokeStyle = colour; context.stroke(); };

// OSM splits a single physical street into many small ways. Rebuild each road type
// as maximal chains, only stopping at real junctions or dead ends—not arbitrary data splits.
function mergeLinks() {
  const output = [];
  for (const type of [...new Set(links.map((item) => item.type))]) {
    const group = links.filter((item) => item.type === type);
    const attached = new Map();
    group.forEach((link, index) => [link.a, link.b].forEach((id) => {
      if (!attached.has(id)) attached.set(id, []); attached.get(id).push(index);
    }));
    const used = new Set();
    const trace = (start, firstEdge) => {
      const ids = [start]; let node = start, edge = firstEdge;
      while (edge !== undefined && !used.has(edge)) {
        used.add(edge);
        const link = group[edge]; const next = link.a === node ? link.b : link.a;
        ids.push(next); node = next;
        const choices = (attached.get(node) || []).filter((candidate) => !used.has(candidate));
        edge = choices.length === 1 && (attached.get(node) || []).length === 2 ? choices[0] : undefined;
      }
      const points = ids.map((id) => pointById[id]).filter(Boolean);
      if (points.length > 1 && points.some(visible)) output.push({ type, points });
    };
    // Start chains from actual intersections and dead ends first.
    attached.forEach((edgeIds, node) => {
      if (edgeIds.length === 2) return;
      edgeIds.forEach((edge) => { if (!used.has(edge)) trace(node, edge); });
    });
    // Close any loops that have no junction/dead-end seed.
    group.forEach((link, edge) => { if (!used.has(edge)) trace(link.a, edge); });
  }
  return output;
}
const renderRoads = mergeLinks();
function closest(point, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, area = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / area));
  const x = a.x + dx * t, y = a.y + dy * t;
  return { x, y, distance: Math.hypot(point.x - x, point.y - y) };
}
function nearestRoad(point) {
  let best = null;
  for (const link of links) {
    const a = pointById[link.a], b = pointById[link.b]; if (!visible(a) && !visible(b)) continue;
    const hit = closest(point, a, b); const width = (style[link.type] || style.residential).width;
    if (!best || hit.distance < best.distance) best = { ...hit, width };
  }
  return best;
}
function pointOnPath(points, distanceAlong) {
  let remaining = distanceAlong;
  for (let i = 1; i < points.length; i++) { const length = dist(points[i - 1], points[i]); if (remaining <= length) { const t = remaining / length; return { x: points[i - 1].x + (points[i].x - points[i - 1].x) * t, y: points[i - 1].y + (points[i].y - points[i - 1].y) * t, angle: Math.atan2(points[i].y - points[i - 1].y, points[i].x - points[i - 1].x) }; } remaining -= length; }
  const a = points.at(-2), b = points.at(-1); return { ...b, angle: Math.atan2(b.y - a.y, b.x - a.x) };
}
const mapLayer = document.createElement('canvas'); mapLayer.width = canvas.width; mapLayer.height = canvas.height; const mapCtx = mapLayer.getContext('2d');
function tree(x, y, r) { mapCtx.fillStyle = '#5a513d55'; mapCtx.beginPath(); mapCtx.ellipse(x + 2, y + 3, r, r * .58, 0, 0, Math.PI * 2); mapCtx.fill(); mapCtx.fillStyle = '#285d3c'; mapCtx.beginPath(); mapCtx.arc(x, y, r, 0, Math.PI * 2); mapCtx.fill(); mapCtx.fillStyle = '#5d8b48'; mapCtx.beginPath(); mapCtx.arc(x - r * .24, y - r * .28, r * .46, 0, Math.PI * 2); mapCtx.fill(); }
function renderMap() {
  const bg = mapCtx.createLinearGradient(0, 0, canvas.width, canvas.height); bg.addColorStop(0, '#e6ddc7'); bg.addColorStop(1, '#c9b998'); mapCtx.fillStyle = bg; mapCtx.fillRect(0, 0, canvas.width, canvas.height);
  let seed = 59; const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let c = 0; c < 34; c++) { const cx = random() * canvas.width, cy = random() * canvas.height; for (let i = 0; i < 2 + Math.floor(random() * 4); i++) tree(cx + (random() - .5) * 44, cy + (random() - .5) * 32, 4 + random() * 7); }
  buildings.forEach((building, index) => { const points = building.p.map((id) => pointById[id]); if (points.length < 4 || !points.some(visible)) return; mapCtx.beginPath(); points.forEach((p, i) => i ? mapCtx.lineTo(p.x, p.y) : mapCtx.moveTo(p.x, p.y)); mapCtx.closePath(); mapCtx.fillStyle = index % 3 === 0 ? '#eee4d2' : index % 3 === 1 ? '#ddd2bd' : '#e6dac5'; mapCtx.fill(); mapCtx.strokeStyle = '#b1a68f'; mapCtx.lineWidth = .9; mapCtx.stroke(); });
  const layers = ['service', 'residential', 'unclassified', 'tertiary', 'secondary', 'primary_link', 'primary', 'motorway'];
  layers.forEach((type) => renderRoads.filter((road) => road.type === type).forEach((road) => { const s = style[type] || style.residential; drawPath(mapCtx, road.points, s.width + 6, '#2f332f55'); drawPath(mapCtx, road.points, s.width + 2, s.edge); drawPath(mapCtx, road.points, s.width - 3, s.road); if (s.lane) { mapCtx.setLineDash([11, 12]); drawPath(mapCtx, road.points, 1.5, '#f5dfa0d9'); mapCtx.setLineDash([]); } }));
  const labels = [{ at: [33.81225, 35.6043], text: 'Route 30' }, { at: [33.81025, 35.60565], text: 'Aley Center' }, { at: [33.80895, 35.60295], text: 'Piscine Street' }];
  labels.forEach(({ at, text }) => { const p = project(at); mapCtx.font = '800 12px system-ui'; const w = mapCtx.measureText(text).width + 16; mapCtx.fillStyle = '#1e2921e8'; mapCtx.fillRect(p.x - w / 2, p.y - 14, w, 23); mapCtx.fillStyle = '#fff8e7'; mapCtx.fillText(text, p.x - w / 2 + 8, p.y + 2); });
}

const spawn = nearestRoad(project([33.80905, 35.60325]));
const car = { x: spawn.x, y: spawn.y, angle: -.28, velocity: 0 };
const deliverySpots = [[33.8125, 35.6052], [33.8105, 35.6086], [33.8080, 35.6015]].map((geo) => nearestRoad(project(geo)));
let delivery = 0, completed = false;
const trafficPaths = renderRoads.filter((road) => ['primary', 'secondary', 'tertiary'].includes(road.type) && road.points.length > 6).sort((a, b) => b.points.length - a.points.length).slice(0, 5);
// Ambient traffic stays deliberately calm, so the streets feel lived-in rather than frantic.
const traffic = trafficPaths.map((road, i) => ({ road, offset: i * 93, speed: 0.052 + i * .006, colour: ['#456f9c', '#d4a440', '#b44f4a', '#7d8f72', '#765c92'][i] }));
const keys = new Set(); let last = performance.now();
function reset() { Object.assign(car, { x: spawn.x, y: spawn.y, angle: -.28, velocity: 0 }); }
function vehicle(x, y, angle, colour, scale = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.shadowColor = '#0009'; ctx.shadowBlur = 7; ctx.fillStyle = colour; ctx.fillRect(-14 * scale, -8 * scale, 28 * scale, 16 * scale); ctx.shadowBlur = 0; ctx.fillStyle = '#1f292c'; ctx.fillRect(-5 * scale, -6 * scale, 11 * scale, 12 * scale); ctx.fillStyle = '#ffe17d'; ctx.fillRect(10 * scale, -4 * scale, 4 * scale, 8 * scale); ctx.strokeStyle = '#fff7df'; ctx.lineWidth = 1.3; ctx.strokeRect(-14 * scale, -8 * scale, 28 * scale, 16 * scale); ctx.restore(); }
function drawDelivery() { if (completed) return; const target = deliverySpots[delivery]; const pulse = 1 + Math.sin(performance.now() / 180) * .12; ctx.beginPath(); ctx.arc(target.x, target.y, 16 * pulse, 0, Math.PI * 2); ctx.fillStyle = '#4ea8eaff'; ctx.fill(); ctx.beginPath(); ctx.arc(target.x, target.y, 7, 0, Math.PI * 2); ctx.fillStyle = '#ecf8ffff'; ctx.fill(); }
function drawTraffic(now) { traffic.forEach((npc) => { const lengths = npc.road.points.slice(1).reduce((sum, point, i) => sum + dist(npc.road.points[i], point), 0); const p = pointOnPath(npc.road.points, (now * npc.speed + npc.offset) % lengths); vehicle(p.x, p.y, p.angle, npc.colour, .72); }); }
function draw(now) { ctx.drawImage(mapLayer, 0, 0); drawDelivery(); drawTraffic(now); vehicle(car.x, car.y, car.angle, '#dd3e37'); }
function update(now) {
  const dt = Math.min((now - last) / 16.67, 2); last = now;
  if (keys.has('w') || keys.has('arrowup')) car.velocity += .085 * dt;
  if (keys.has('s') || keys.has('arrowdown')) car.velocity -= .1 * dt;
  car.velocity *= Math.pow(.94, dt); car.velocity = Math.max(-2.7, Math.min(4.8, car.velocity));
  const turn = (keys.has('a') || keys.has('arrowleft') ? -1 : 0) + (keys.has('d') || keys.has('arrowright') ? 1 : 0);
  car.angle += turn * .047 * dt * (car.velocity >= 0 ? 1 : -1);
  const candidate = { x: car.x + Math.cos(car.angle) * car.velocity * dt, y: car.y + Math.sin(car.angle) * car.velocity * dt };
  const surface = nearestRoad(candidate);
  if (surface && surface.distance <= surface.width / 2 + 8) { car.x = surface.x; car.y = surface.y; } else car.velocity *= .35;
  if (!completed && Math.hypot(car.x - deliverySpots[delivery].x, car.y - deliverySpots[delivery].y) < 22) { delivery++; if (delivery === deliverySpots.length) completed = true; }
  speedLabel.textContent = `${Math.round(Math.abs(car.velocity) * 19)} km/h`;
  missionLabel.textContent = completed ? 'Shift complete ✓' : `Delivery ${delivery + 1}/${deliverySpots.length}`;
  locationLabel.textContent = car.y < canvas.height * .28 ? 'Route 30' : car.x > canvas.width * .57 ? 'Aley Center side' : 'Piscine Street';
  draw(now); requestAnimationFrame(update);
}
addEventListener('keydown', (event) => { const key = event.key.toLowerCase(); if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','r'].includes(key)) event.preventDefault(); keys.add(key); if (key === 'r') reset(); });
addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
renderMap(); draw(performance.now()); requestAnimationFrame(update);
