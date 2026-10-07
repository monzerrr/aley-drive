'use strict';
// Landmark positions mapped to new world coordinates (WW=4176, WH=2756).
// Scale: x_world = img_x * 3.302,  y_world = img_y * 4.083

const LANDMARKS = [
  // near highway top
  { x:1716, y: 660, w:150, h:100, color:'#5d4037', label:'Aley Padel' },
  { x:2079, y: 700, w:150, h:100, color:'#6d4c41', label:'Al Abdalla' },

  // Aley town center (img ~center y≈320-380)
  { x:1980, y:1330, w:165, h:105, color:'#1565c0', label:'Aley Center' },
  { x:2376, y:1298, w:165, h:105, color:'#4a148c', label:'The Game Aley' },
  { x:2244, y:1461, w:135, h: 90, color:'#b71c1c', label:'Al-Iman Hosp.' },
  { x:1980, y:1477, w:135, h: 90, color:'#bf360c', label:'Stories Coffee' },

  // middle belt
  { x: 594, y:1428, w:135, h: 90, color:'#263238', label:'Aley Municipality' },
  { x: 990, y:1420, w:120, h: 84, color:'#01579b', label:'Ittihad Sweets' },
  { x:1452, y:1436, w:150, h: 99, color:'#880e4f', label:'Obeid Mall' },
  { x:1716, y:1249, w:120, h: 84, color:'#e65100', label:'Piscine area' },

  // lower
  { x: 462, y:1959, w:135, h: 90, color:'#2e7d32', label:'Goodlife Gym' },
  { x:1716, y:2008, w:120, h: 84, color:'#37474f', label:'Jarir Printing' },

  // south
  { x: 462, y:2318, w:150, h: 99, color:'#388e3c', label:'Mountain Park' },
  { x:1716, y:2261, w:120, h: 84, color:'#0277bd', label:'Ain Hala' },
  { x: 858, y:2498, w:120, h: 84, color:'#c62828', label:'Ain El Saydeh' },
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
