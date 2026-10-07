'use strict';
// Landmarks hand-placed from Aley satellite image (3× scale).
// Each: { x, y, w, h, color, label }

const LANDMARKS = [
  // ── NORTH / UPPER AREA ───────────────────────────────────────────────────
  { x:1590, y:210,  w:180, h:120, color:'#5d4037', label:'Aley Resort & Terrace' },
  { x:1860, y:420,  w:150, h:100, color:'#6d4c41', label:'Al Abdalla' },
  { x:750,  y:840,  w:120, h:90,  color:'#4caf50', label:'Aley Tennis Club' },

  // ── ROUTE 30 / UPPER RESIDENTIAL BAND ────────────────────────────────────
  { x:930,  y:960,  w:150, h:120, color:'#388e3c', label:'FADI KA Playground' },
  { x:1170, y:1200, w:120, h:90,  color:'#7b1fa2', label:"Nathalie's Building" },
  { x:2430, y:1140, w:180, h:120, color:'#1565c0', label:'Aley Center' },
  { x:2640, y:1020, w:120, h:90,  color:'#0277bd', label:'Hisham Dlaykan' },
  { x:3540, y:855,  w:150, h:105, color:'#f57f17', label:'Lahib Center' },

  // ── MIDDLE BAND (around Rue Bsatine) ──────────────────────────────────────
  { x:2010, y:1350, w:120, h:90,  color:'#e65100', label:'The Host' },
  { x:2160, y:1470, w:120, h:90,  color:'#bf360c', label:'Stories Coffee' },
  { x:3720, y:1200, w:150, h:105, color:'#4a148c', label:'The Game Aley' },
  { x:3060, y:1530, w:120, h:90,  color:'#b71c1c', label:'Al-Iman Hospital' },

  // ── LOWER MIDDLE ──────────────────────────────────────────────────────────
  { x:330,  y:1770, w:150, h:120, color:'#1a237e', label:'Aley College UCA' },
  { x:480,  y:2160, w:120, h:90,  color:'#263238', label:'Aley Municipality' },
  { x:1530, y:2040, w:120, h:90,  color:'#01579b', label:'BLOM Bank' },
  { x:2160, y:2190, w:150, h:105, color:'#880e4f', label:'Obeid Mall' },
  { x:2880, y:2310, w:150, h:120, color:'#2e7d32', label:'Aley Public Garden' },

  // ── SOUTH ─────────────────────────────────────────────────────────────────
  { x:450,  y:2460, w:120, h:90,  color:'#c62828', label:'Lebanese Red Cross' },
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
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.label.length > 14 ? b.label.slice(0,13)+'…' : b.label, b.x, b.y);
  }
}
