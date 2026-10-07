'use strict';
// Landmark positions remapped to match OSM-traced road coordinates.
// Scale from OSM image: x_game = x_img × 3.32, y_game = y_img × 3.89

const LANDMARKS = [
  // ── Along Route 30 ────────────────────────────────────────────────────────────────────────────
  { x:1200, y:560,  w:150, h:100, color:'#5d4037', label:'Aley Padel' },
  { x:1500, y:620,  w:150, h:100, color:'#6d4c41', label:'Al Abdalla' },

  // ── Aley town center ───────────────────────────────────────────────────────────────────────
  { x:1800, y:1300, w:165, h:105, color:'#1565c0', label:'Aley Center' },
  { x:2300, y:1270, w:165, h:105, color:'#4a148c', label:'The Game Aley' },
  { x:2200, y:1420, w:135, h:90,  color:'#b71c1c', label:'Al-Iman Hosp.' },
  { x:1900, y:1440, w:135, h:90,  color:'#bf360c', label:'Stories Coffee' },

  // ── Middle belt ────────────────────────────────────────────────────────────────────────────
  { x:500,  y:1459, w:135, h:90,  color:'#263238', label:'Aley Municipality' },
  { x:996,  y:1450, w:120, h:84,  color:'#01579b', label:'Ittihad Sweets' },
  { x:1494, y:1460, w:150, h:99,  color:'#880e4f', label:'Obeid Mall' },
  { x:1700, y:1220, w:120, h:84,  color:'#e65100', label:'Piscine area' },

  // ── Lower belt ────────────────────────────────────────────────────────────────────────────
  { x:430,  y:1860, w:135, h:90,  color:'#2e7d32', label:'Goodlife Gym' },
  { x:1660, y:1950, w:120, h:84,  color:'#37474f', label:'Jarir Printing' },

  // ── South ──────────────────────────────────────────────────────────────────────────────────
  { x:450,  y:2256, w:150, h:99,  color:'#388e3c', label:'Mountain Park' },
  { x:1660, y:2200, w:120, h:84,  color:'#0277bd', label:'Ain Hala' },
  { x:800,  y:2430, w:120, h:84,  color:'#c62828', label:'Ain El Saydeh' },
];

function drawBuildings(ctx) {
  for (const b of LANDMARKS) {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.roundRect(b.x - b.w/2, b.y - b.h/2, b.w, b.h, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.label, b.x, b.y);
  }
}
