'use strict';
// Road network traced from OSM satellite image of Aley, Lebanon.
// Image 1265×675px → world 4200×2625px (scale x×3.32, y×3.89)
// Each road: { w: width in world-px, p: [[x,y], …] }

const WW = 4200, WH = 2625;

const ROADS = [
  // ── ROUTE 30 ── main highway, enters west at y≈370, curves down to Aley junction y≈720
  { w:42, p:[
    [0,370],[332,370],[664,389],[996,409],[1328,448],[1660,526],[1992,623],[2160,672],[2360,720],
    [2590,727],[2820,727],[3050,733],[3300,739],[3600,746],[3900,752],[4200,758]
  ]},

  // ── ROUTE 30 NE BRANCH ── peels off at Aley junction, goes NE toward Dhour El Abadieh
  { w:36, p:[
    [2360,720],[2590,604],[2820,487],[3050,370],[3320,214],[3600,97],[3900,39],[4200,0]
  ]},

  // ── WEST SPINE ── main N-S road on left (Bsous → Ain El Roumaneh → Qmatiyeh)
  { w:26, p:[
    [249,97],[249,370],[249,720],[266,1089],[299,1420],[332,1770],[299,2101],[216,2393],[100,2586]
  ]},

  // ── RUE DE LA PISCINE ── diagonal SW from near Aley junction
  { w:26, p:[
    [2160,816],[1876,1050],[1577,1284],[1295,1537],[1013,1790],[714,2023],[432,2256],[166,2490]
  ]},

  // ── MAIN ALEY ROAD ── primary E-W through town center
  { w:28, p:[
    [0,1459],[498,1420],[996,1381],[1494,1362],[1992,1381],[2490,1420],[2988,1498],[3486,1576],
    [3900,1693],[4200,1809]
  ]},

  // ── ALEY JUNCTION N-S ── connects Route 30 down to town
  { w:22, p:[
    [2360,720],[2341,895],[2308,1109],[2275,1362]
  ]},

  // ── EAST CONNECTOR ── N-S east of junction
  { w:20, p:[
    [2822,727],[2805,1011],[2772,1284],[2739,1420]
  ]},

  // ── CONNECTOR x≈1494 ── N-S from Route 30 to town
  { w:20, p:[
    [1494,448],[1494,720],[1511,1050],[1528,1362]
  ]},

  // ── CONNECTOR x≈1743 ── N-S
  { w:18, p:[
    [1743,603],[1743,895],[1743,1167],[1743,1381]
  ]},

  // ── EAST ROAD toward Bakhshas ── SE from town
  { w:22, p:[
    [3154,1537],[3353,1770],[3536,2023],[3685,2295],[3867,2548],[4033,2625]
  ]},

  // ── SOUTH E-W ── through lower residential
  { w:20, p:[
    [664,2179],[1162,2140],[1660,2101],[2159,2140],[2657,2179],[3155,2256],[3653,2354]
  ]},

  // ── WEST CONNECTOR ── left side joining Piscine St to main road
  { w:18, p:[
    [432,2256],[499,2179],[548,1926],[598,1693],[631,1420]
  ]},

  // ── MID CONNECTOR EAST ── x≈1660 south spine
  { w:18, p:[
    [1660,1362],[1677,1615],[1693,1868],[1710,2101]
  ]},

  // ── MID CONNECTOR ── x≈2141 south spine
  { w:18, p:[
    [2275,1362],[2275,1615],[2275,1868],[2275,2101]
  ]},

  // ── NORTH OF ROUTE 30 ── toward upper residential
  { w:18, p:[
    [249,370],[249,214],[249,97]
  ]},
  { w:18, p:[
    [996,409],[996,253],[996,97]
  ]},
  { w:18, p:[
    [1494,448],[1494,292],[1494,136],[1494,0]
  ]},
];

// ── Road collision test ───────────────────────────────────────────────
function pointOnRoad(px, py) {
  for (const r of ROADS) {
    const h2 = (r.w * 0.5) ** 2;
    const pts = r.p;
    for (let i = 0; i < pts.length - 1; i++) {
      const ax=pts[i][0], ay=pts[i][1], bx=pts[i+1][0], by=pts[i+1][1];
      const dx=bx-ax, dy=by-ay, l2=dx*dx+dy*dy;
      if (!l2) continue;
      const t = Math.max(0, Math.min(1, ((px-ax)*dx+(py-ay)*dy)/l2));
      const ex=ax+t*dx-px, ey=ay+t*dy-py;
      if (ex*ex+ey*ey < h2) return true;
    }
  }
  return false;
}
