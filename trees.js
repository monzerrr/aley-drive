'use strict';
// Deterministic tree placement — seeded LCG, avoids roads & landmarks.

const TREE_COLORS = ['#1b5e20','#2e7d32','#388e3c','#194d09','#145a32','#0a3d0a','#27ae60','#33691e'];

function lcg(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; };
}

function buildTrees() {
  const rng = lcg(31337);
  const trees = [];
  const margin = 30;
  let attempts = 0;
  while (trees.length < 600 && attempts < 60000) {
    attempts++;
    const tx = margin + rng() * (WW - margin*2);
    const ty = margin + rng() * (WH - margin*2);
    if (pointOnRoad(tx, ty)) continue;
    let nearLandmark = false;
    for (const b of LANDMARKS) {
      const dx = tx - b.x, dy = ty - b.y;
      if (dx*dx + dy*dy < (b.w*0.7)**2) { nearLandmark = true; break; }
    }
    if (nearLandmark) continue;
    const r = 8 + rng() * 14;
    const col = TREE_COLORS[Math.floor(rng() * TREE_COLORS.length)];
    trees.push({ x:tx, y:ty, r, col });
  }
  return trees;
}

const TREES = buildTrees();

function drawTrees(ctx) {
  for (const t of TREES) {
    ctx.fillStyle = t.col;
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.r, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,60,0,0.35)';
    ctx.beginPath();
    ctx.arc(t.x + t.r*0.3, t.y + t.r*0.3, t.r*0.55, 0, Math.PI*2);
    ctx.fill();
  }
}
