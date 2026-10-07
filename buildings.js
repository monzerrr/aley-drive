'use strict';
// Landmark positions re-traced from satellite image (coords × 3 = world px).
// image (x,y) × 3 = world (x,y)

const LANDMARKS = [
  // ── Along / north of Route 30 ─────────────────────────────────────────────
  { x:1350, y:480,  w:150, h:100, color:'#5d4037', label:'Aley Padel' },
  { x:1530, y:570,  w:150, h:100, color:'#6d4c41', label:'Al Abdalla' },

  // ── Upper residential (just below Route 30 arc) ───────────────────────────
  { x:1620, y:975,  w:165, h:105, color:'#1565c0', label:'Aley Center' },
  { x:2340, y:1005, w:165, h:105, color:'#4a148c', label:'The Game Aley' },
  { x:2250, y:1170, w:135, h:90,  color:'#b71c1c', label:'Al-Iman Hosp.' },
  { x:1710, y:1134, w:135, h:90,  color:'#bf360c', label:'Stories Coffee' },

  // ── Middle belt (Rue Bsatine / second E-W) ────────────────────────────────
  { x:789,  y:1485, w:135, h:90,  color:'#263238', label:'Aley Municipality' },
  { x:1050, y:1536, w:120, h:84,  color:'#01579b', label:'Ittihad Sweets' },
  { x:1389, y:1500, w:150, h:99,  color:'#880e4f', label:'Obeid Mall' },
  { x:1560, y:1134, w:120, h:84,  color:'#e65100', label:'Piscine area' },

  // ── Lower belt ────────────────────────────────────────────────────────────
  { x:525,  y:1800, w:135, h:90,  color:'#2e7d32', label:'Goodlife Gym' },
  { x:1530, y:1950, w:120, h:84,  color:'#37474f', label:'Jarir Printing' },

  // ── South ─────────────────────────────────────────────────────────────────
  { x:489,  y:2205, w:150, h:99,  color:'#388e3c', label:'Mountain Park' },
  { x:1590, y:2220, w:120, h:84,  color:'#0277bd', label:'Ain Hala' },
  { x:789,  y:2460, w:120, h:84,  color:'#c62828', label:'Ain El Saydeh' },
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
