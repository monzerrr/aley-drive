'use strict';
// ── Constants ────────────────────────────────────────────────────────────────────────────
const PX_PER_KMH = 3.2;
const MAX_SPEED  = 140;
const ACCEL      = 80;
const BRAKE      = 180;
const FRICTION   = 20;
const OFF_FRIC   = 55;
const OFF_MAX    = 40;
// Steering: max deg/s at top speed; smoothed with 12 deg/s² ramp so no snap
const TURN_BASE  = 240;
const STEER_RAMP = 420; // deg/s² — how fast steer rate ramps up/down

// ── State ────────────────────────────────────────────────────────────────────────────
const car = {
  x: 2376, y: 530,   // on highway at Aley junction (نقاطع عاليه 12), facing east
  angle: 0,
  speed: 0,
  steerRate: 0,       // current actual turning rate (rad/s), smoothed
};

const cam = { x: car.x, y: car.y };
const keys = {};

let offRoadAlpha = 0;
let showMap = false;
let canvas, ctx;

// ── Init ────────────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('c');
  ctx    = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', e => {
    if (e.key === 'm' || e.key === 'M') { showMap = !showMap; return; }
    keys[e.key] = true;
    e.preventDefault();
  });
  window.addEventListener('keyup', e => { keys[e.key] = false; });
  requestAnimationFrame(loop);
});

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

// ── Main loop ──────────────────────────────────────────────────────────────────────────
let last = 0;
function loop(ts) {
  const dt = Math.min((ts - last) / 1000, 0.05);
  last = ts;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

// ── Physics ──────────────────────────────────────────────────────────────────────────
function update(dt) {
  const fwd   = keys['ArrowUp']    || keys['w'] || keys['W'];
  const back  = keys['ArrowDown']  || keys['s'] || keys['S'];
  const left  = keys['ArrowLeft']  || keys['a'] || keys['A'];
  const right = keys['ArrowRight'] || keys['d'] || keys['D'];

  const onRd = pointOnRoad(car.x, car.y);
  const topSpd = onRd ? MAX_SPEED : OFF_MAX;
  if (fwd)       car.speed = Math.min(topSpd, car.speed + ACCEL * dt);
  else if (back) car.speed = Math.max(-topSpd * 0.4, car.speed - BRAKE * dt);
  else {
    const fr = onRd ? FRICTION : OFF_FRIC;
    if (car.speed > 0) car.speed = Math.max(0, car.speed - fr * dt);
    else               car.speed = Math.min(0, car.speed + fr * dt);
  }
  if (!onRd && Math.abs(car.speed) > OFF_MAX)
    car.speed = car.speed > 0
      ? Math.max(OFF_MAX, car.speed - OFF_FRIC * dt)
      : Math.min(-OFF_MAX * 0.4, car.speed + OFF_FRIC * dt);

  const spd = Math.abs(car.speed);
  const maxRate = TURN_BASE * Math.max(0.15, spd / MAX_SPEED) * (Math.PI / 180);
  const rampRad = STEER_RAMP * (Math.PI / 180) * dt;
  const targetRate = left  ? -maxRate * Math.sign(car.speed)
                   : right ?  maxRate * Math.sign(car.speed)
                   : 0;
  // Ramp steer rate toward target — prevents snapping
  if (car.steerRate < targetRate) car.steerRate = Math.min(targetRate, car.steerRate + rampRad);
  else                            car.steerRate = Math.max(targetRate, car.steerRate - rampRad);
  car.angle += car.steerRate * dt;

  car.x += Math.cos(car.angle) * car.speed * PX_PER_KMH * dt;
  car.y += Math.sin(car.angle) * car.speed * PX_PER_KMH * dt;
  car.x = Math.max(0, Math.min(WW, car.x));
  car.y = Math.max(0, Math.min(WH, car.y));

  const lerp = 0.14;
  cam.x += (car.x - cam.x) * lerp;
  cam.y += (car.y - cam.y) * lerp;

  offRoadAlpha += ((onRd ? 0 : 0.6) - offRoadAlpha) * Math.min(1, dt * 4);
}

// ── Rendering ──────────────────────────────────────────────────────────────────────────
function render() {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  ctx.save();
  ctx.translate(W/2 - cam.x, H/2 - cam.y);

  // Ground
  ctx.fillStyle = '#3a4a2e';
  ctx.fillRect(0, 0, WW, WH);

  drawTrees(ctx);
  drawRoads(ctx);
  drawBuildings(ctx);
  drawCar(ctx);

  ctx.restore();

  // HUD
  drawSpeedometer(ctx, W, H);
  drawMinimap(ctx, W, H);
  drawOffRoadWarning(ctx, W, H);
  if (showMap) drawFullMap(ctx, W, H);
}

function drawRoads(ctx) {
  for (const r of ROADS) {
    const isR30 = r.w >= 38;
    // Kerb
    ctx.strokeStyle = '#111';
    ctx.lineWidth = r.w + 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    strokePath(ctx, r.p);

    // Asphalt base
    ctx.strokeStyle = isR30 ? '#3a3a3a' : '#484848';
    ctx.lineWidth = r.w;
    strokePath(ctx, r.p);

    // Surface
    ctx.strokeStyle = isR30 ? '#4a4040' : '#585858';
    ctx.lineWidth = r.w - 4;
    strokePath(ctx, r.p);

    // Center line
    ctx.strokeStyle = isR30 ? 'rgba(255,210,0,0.45)' : 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([40, 30]);
    strokePath(ctx, r.p);
    ctx.setLineDash([]);
  }
}

function strokePath(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

function drawCar(ctx) {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(4, 4, 22, 12, 0, 0, Math.PI*2);
  ctx.fill();
  // Body
  ctx.fillStyle = '#e53935';
  ctx.beginPath();
  ctx.roundRect(-22, -11, 44, 22, 5);
  ctx.fill();
  // Windshield
  ctx.fillStyle = 'rgba(180,220,255,0.7)';
  ctx.beginPath();
  ctx.roundRect(2, -8, 14, 16, 2);
  ctx.fill();
  // Wheels
  ctx.fillStyle = '#222';
  [[-14,-12],[-14,12],[14,-12],[14,12]].forEach(([wx,wy]) => {
    ctx.beginPath();
    ctx.roundRect(wx-5, wy-4, 10, 8, 2);
    ctx.fill();
  });
  ctx.restore();
}

// ── Speedometer ──────────────────────────────────────────────────────────────────────────
function drawSpeedometer(ctx, W, H) {
  const cx = W - 100, cy = H - 100, r = 72;
  const startA = Math.PI * 0.75, endA = Math.PI * 2.25;
  const spd = Math.abs(car.speed);
  const frac = spd / MAX_SPEED;

  ctx.save();
  // Background disc
  ctx.fillStyle = 'rgba(10,10,10,0.82)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fill();

  // Color arc
  const arcEnd = startA + (endA - startA) * frac;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.strokeStyle = frac < 0.5 ? '#4caf50' : frac < 0.8 ? '#ffc107' : '#f44336';
  ctx.beginPath();
  ctx.arc(cx, cy, r - 8, startA, arcEnd);
  ctx.stroke();

  // Track
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 8, arcEnd, endA);
  ctx.stroke();

  // Speed text
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${r * 0.52}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(Math.round(spd), cx, cy - 6);

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `${r * 0.22}px sans-serif`;
  ctx.fillText('km/h', cx, cy + r * 0.38);

  ctx.restore();
}

// ── Minimap ─────────────────────────────────────────────────────────────────────────────
function drawMinimap(ctx, W, H) {
  const mw = 150, mh = 94, mx = 12, my = H - mh - 12;
  const sx = mw / WW, sy = mh / WH;

  ctx.save();
  ctx.fillStyle = 'rgba(10,10,10,0.72)';
  ctx.beginPath();
  ctx.roundRect(mx, my, mw, mh, 6);
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(mx, my, mw, mh, 6);
  ctx.clip();

  // Roads on minimap
  for (const r of ROADS) {
    const isR30 = r.w >= 38;
    ctx.strokeStyle = isR30 ? '#e6b800' : '#888';
    ctx.lineWidth = Math.max(1, r.w * sx * 0.6);
    ctx.beginPath();
    ctx.moveTo(mx + r.p[0][0]*sx, my + r.p[0][1]*sy);
    for (let i = 1; i < r.p.length; i++)
      ctx.lineTo(mx + r.p[i][0]*sx, my + r.p[i][1]*sy);
    ctx.stroke();
  }

  // Car dot
  ctx.fillStyle = '#f44336';
  ctx.beginPath();
  ctx.arc(mx + car.x*sx, my + car.y*sy, 3, 0, Math.PI*2);
  ctx.fill();

  ctx.restore();
}

// ── Off-road warning ────────────────────────────────────────────────────────────────
function drawOffRoadWarning(ctx, W, H) {
  if (offRoadAlpha < 0.01) return;
  ctx.save();
  ctx.globalAlpha = offRoadAlpha;
  ctx.strokeStyle = '#ff5722';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, W-6, H-6);
  ctx.fillStyle = '#ff5722';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('OFF ROAD', W/2, 36);
  ctx.restore();
}

// ── Full map overlay (M key) ────────────────────────────────────────────────────────────────
function drawFullMap(ctx, W, H) {
  const pad = 40;
  const mw = W - pad*2, mh = H - pad*2;
  const sx = mw / WW, sy = mh / WH;
  const ox = pad, oy = pad;

  ctx.save();
  ctx.fillStyle = 'rgba(10,12,10,0.92)';
  ctx.beginPath();
  ctx.roundRect(ox - 8, oy - 8, mw + 16, mh + 16, 12);
  ctx.fill();

  ctx.fillStyle = '#2a3a1e';
  ctx.beginPath();
  ctx.roundRect(ox, oy, mw, mh, 8);
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(ox, oy, mw, mh, 8);
  ctx.clip();

  for (const r of ROADS) {
    const big = r.w >= 38;
    ctx.strokeStyle = '#111';
    ctx.lineWidth = Math.max(2, (r.w + 6) * sx);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(ox + r.p[0][0]*sx, oy + r.p[0][1]*sy);
    for (let i = 1; i < r.p.length; i++) ctx.lineTo(ox + r.p[i][0]*sx, oy + r.p[i][1]*sy);
    ctx.stroke();

    ctx.strokeStyle = big ? '#5a5050' : '#686868';
    ctx.lineWidth = Math.max(1.5, r.w * sx);
    ctx.beginPath();
    ctx.moveTo(ox + r.p[0][0]*sx, oy + r.p[0][1]*sy);
    for (let i = 1; i < r.p.length; i++) ctx.lineTo(ox + r.p[i][0]*sx, oy + r.p[i][1]*sy);
    ctx.stroke();

    if (big) {
      ctx.strokeStyle = 'rgba(255,210,0,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(ox + r.p[0][0]*sx, oy + r.p[0][1]*sy);
      for (let i = 1; i < r.p.length; i++) ctx.lineTo(ox + r.p[i][0]*sx, oy + r.p[i][1]*sy);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  for (const b of LANDMARKS) {
    const bx = ox + b.x*sx, by = oy + b.y*sy;
    const bw = Math.max(8, b.w*sx), bh = Math.max(5, b.h*sy);
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.roundRect(bx - bw/2, by - bh/2, bw, bh, 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(9, Math.round(11 * sx * 50))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.label, bx, by);
  }

  ctx.fillStyle = '#f44336';
  ctx.beginPath();
  ctx.arc(ox + car.x*sx, oy + car.y*sy, 5, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('M — close map', W/2, oy + mh + 22);
  ctx.restore();
}
