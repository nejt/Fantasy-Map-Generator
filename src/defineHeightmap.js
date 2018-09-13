// Generate Heigtmap routine
function defineHeightmap() {
  let o = options.heightmapTemplate
  console.time('defineHeightmap');
  if (!o.locked) {
    const rnd = Math.random();
    if (rnd > 0.95) {
      o.input = "Volcano";
    } else if (rnd > 0.75) {
      o.input = "High Island";
    } else if (rnd > 0.55) {
      o.input = "Low Island";
    } else if (rnd > 0.35) {
      o.input = "Continents";
    } else if (rnd > 0.15) {
      o.input = "Archipelago";
    } else if (rnd > 0.10) {
      o.input = "Mainland";
    } else if (rnd > 0.01) {
      o.input = "Peninsulas";
    } else {
      o.input = "Atoll";
    }
  }
  const mapTemplate = o.input
  if (mapTemplate === "Volcano")
    templateVolcano();
  if (mapTemplate === "High Island")
    templateHighIsland();
  if (mapTemplate === "Low Island")
    templateLowIsland();
  if (mapTemplate === "Continents")
    templateContinents();
  if (mapTemplate === "Archipelago")
    templateArchipelago();
  if (mapTemplate === "Atoll")
    templateAtoll();
  if (mapTemplate === "Mainland")
    templateMainland();
  if (mapTemplate === "Peninsulas")
    templatePeninsulas();
  console.log(" template: " + mapTemplate);
  console.timeEnd('defineHeightmap');
}

// Heighmap Template: Volcano
function templateVolcano(mod) {
  addMountain();
  modifyHeights("all", 10, 1);
  addHill(5, 0.35);
  addRange(3);
  addRange(-4);
}

// Heighmap Template: High Island
function templateHighIsland(mod) {
  addMountain();
  modifyHeights("all", 10, 1);
  addRange(6);
  addHill(12, 0.25);
  addRange(-3);
  modifyHeights("land", 0, 0.75);
  addPit(1);
  addHill(3, 0.15);
}

// Heighmap Template: Low Island
function templateLowIsland(mod) {
  addMountain();
  modifyHeights("all", 10, 1);
  smoothHeights(2);
  addRange(2);
  addHill(4, 0.4);
  addHill(12, 0.2);
  addRange(-8);
  modifyHeights("land", 0, 0.35);
}

// Heighmap Template: Continents
function templateContinents(mod) {
  addMountain();
  modifyHeights("all", 10, 1);
  addHill(30, 0.25);
  const count = Math.ceil(Math.random() * 4 + 4);
  addStrait(count);
  addPit(10);
  addRange(-10);
  modifyHeights("land", 0, 0.6);
  smoothHeights(2);
  addRange(3);
}

// Heighmap Template: Archipelago
function templateArchipelago(mod) {
  addMountain();
  modifyHeights("all", 10, 1);
  addHill(12, 0.15);
  addRange(8);
  const count = Math.ceil(Math.random() * 2 + 2);
  addStrait(count);
  addRange(-15);
  addPit(10);
  modifyHeights("land", -5, 0.7);
  smoothHeights(3);
}

// Heighmap Template: Atoll
function templateAtoll(mod) {
  addMountain();
  modifyHeights("all", 10, 1);
  addHill(2, 0.35);
  addRange(2);
  smoothHeights(1);
  modifyHeights("27-100", 0, 0.1);
}

// Heighmap Template: Mainland
function templateMainland(mod) {
  addMountain();
  modifyHeights("all", 10, 1);
  addHill(30, 0.2);
  addRange(10);
  addPit(20);
  addHill(10, 0.15);
  addRange(-10);
  modifyHeights("land", 0, 0.4);
  addRange(10);
  smoothHeights(3);
}

// Heighmap Template: Peninsulas
function templatePeninsulas(mod) {
  addMountain();
  modifyHeights("all", 15, 1);
  addHill(30, 0);
  addRange(5);
  addPit(15);
  const count = Math.ceil(Math.random() * 5 + 15);
  addStrait(count);
}

function addMountain() {
  const x = Math.floor(Math.random() * graphWidth / 3 + graphWidth / 3);
  const y = Math.floor(Math.random() * graphHeight * 0.2 + graphHeight * 0.4);
  const cell = diagram.find(x, y).index;
  const height = Math.random() * 10 + 90;
  // 90-99
  add(cell, "mountain", height);
}

// place with shift 0-0.5
function addHill(count, shift) {
  for (let c = 0; c < count; c++) {
    let limit = 0, cell, height;
    do {
      height = Math.random() * 40 + 10;
      // 10-50
      const x = Math.floor(Math.random() * graphWidth * (1 - shift * 2) + graphWidth * shift);
      const y = Math.floor(Math.random() * graphHeight * (1 - shift * 2) + graphHeight * shift);
      cell = diagram.find(x, y).index;
      limit++;
    } while (heights[cell] + height > 90 && limit < 100)add(cell, "hill", height);
  }
}

function add(start, type, height) {
  const session = Math.ceil(Math.random() * 1e5);
  let radius, hRadius, mRadius;
  switch (+graphSize) {
  case 1:
    hRadius = 0.991;
    mRadius = 0.91;
    break;
  case 2:
    hRadius = 0.9967;
    mRadius = 0.951;
    break;
  case 3:
    hRadius = 0.999;
    mRadius = 0.975;
    break;
  case 4:
    hRadius = 0.9994;
    mRadius = 0.98;
    break;
  }
  radius = type === "mountain" ? mRadius : hRadius;
  var queue = [start];
  if (type === "mountain")
    heights[start] = height;
  for (let i = 0; i < queue.length && height >= 1; i++) {
    if (type === "mountain") {
      height = heights[queue[i]] * radius - height / 100;
    } else {
      height *= radius;
    }
    cells[queue[i]].neighbors.forEach(function(e) {
      if (cells[e].used === session)
        return;
      const mod = Math.random() * 0.2 + 0.9;
      // 0.9-1.1 random factor
      heights[e] += height * mod;
      if (heights[e] > 100)
        heights[e] = 100;
      cells[e].used = session;
      queue.push(e);
    });
  }
}

function addRange(mod, height, from, to) {
  var session = Math.ceil(Math.random() * 100000);
  var count = Math.abs(mod);
  let range = [];
  for (let c = 0; c < count; c++) {
    range = [];
    var diff = 0
      , start = from
      , end = to;
    if (!start || !end) {
      do {
        var xf = Math.floor(Math.random() * (graphWidth * 0.7)) + graphWidth * 0.15;
        var yf = Math.floor(Math.random() * (graphHeight * 0.6)) + graphHeight * 0.2;
        start = diagram.find(xf, yf).index;
        var xt = Math.floor(Math.random() * (graphWidth * 0.7)) + graphWidth * 0.15;
        var yt = Math.floor(Math.random() * (graphHeight * 0.6)) + graphHeight * 0.2;
        end = diagram.find(xt, yt).index;
        diff = Math.hypot(xt - xf, yt - yf);
      } while (diff < 150 / graphSize || diff > 300 / graphSize)
    }
    if (start && end) {
      for (let l = 0; start != end && l < 10000; l++) {
        var min = 10000;
        cells[start].neighbors.forEach(function(e) {
          diff = Math.hypot(cells[end].data[0] - cells[e].data[0], cells[end].data[1] - cells[e].data[1]);
          if (Math.random() > 0.8)
            diff = diff / 2;
          if (diff < min) {
            min = diff,
            start = e;
          }
        });
        range.push(start);
      }
    }
    var change = height ? height : Math.random() * 10 + 10;
    range.map(function(r) {
      let rnd = Math.random() * 0.4 + 0.8;
      if (mod > 0)
        heights[r] += change * rnd;
      else if (heights[r] >= 10) {
        heights[r] -= change * rnd;
      }
      cells[r].neighbors.forEach(function(e) {
        if (cells[e].used === session)
          return;
        cells[e].used = session;
        rnd = Math.random() * 0.4 + 0.8;
        const ch = change / 2 * rnd;
        if (mod > 0) {
          heights[e] += ch;
        } else if (heights[e] >= 10) {
          heights[e] -= ch;
        }
        if (heights[e] > 100)
          heights[e] = mod > 0 ? 100 : 5;
      });
      if (heights[r] > 100)
        heights[r] = mod > 0 ? 100 : 5;
    });
  }
  return range;
}

function addStrait(width) {
  var session = Math.ceil(Math.random() * 100000);
  var top = Math.floor(Math.random() * graphWidth * 0.35 + graphWidth * 0.3);
  var bottom = Math.floor((graphWidth - top) - (graphWidth * 0.1) + (Math.random() * graphWidth * 0.2));
  var start = diagram.find(top, graphHeight * 0.1).index;
  var end = diagram.find(bottom, graphHeight * 0.9).index;
  var range = [];
  for (let l = 0; start !== end && l < 1000; l++) {
    var min = 10000;
    // dummy value
    cells[start].neighbors.forEach(function(e) {
      diff = Math.hypot(cells[end].data[0] - cells[e].data[0], cells[end].data[1] - cells[e].data[1]);
      if (Math.random() > 0.8) {
        diff = diff / 2
      }
      if (diff < min) {
        min = diff;
        start = e;
      }
    });
    range.push(start);
  }
  var query = [];
  for (; width > 0; width--) {
    range.map(function(r) {
      cells[r].neighbors.forEach(function(e) {
        if (cells[e].used === session) {
          return;
        }
        cells[e].used = session;
        query.push(e);
        heights[e] *= 0.23;
        if (heights[e] > 100 || heights[e] < 5)
          heights[e] = 5;
      });
      range = query.slice();
    });
  }
}

function addPit(count, height, cell) {
  const session = Math.ceil(Math.random() * 1e5);
  for (let c = 0; c < count; c++) {
    let change = height ? height + 10 : Math.random() * 10 + 20;
    let start = cell;
    if (!start) {
      const lowlands = cells.filter(function(e) {
        return (heights[e.index] >= 20);
      });
      if (!lowlands.length)
        return;
      const rnd = Math.floor(Math.random() * lowlands.length);
      start = lowlands[rnd].index;
    }
    let query = [start]
      , newQuery = [];
    // depress pit center
    heights[start] -= change;
    if (heights[start] < 5 || heights[start] > 100)
      heights[start] = 5;
    cells[start].used = session;
    for (let i = 1; i < 10000; i++) {
      const rnd = Math.random() * 0.4 + 0.8;
      change -= i / 0.6 * rnd;
      if (change < 1)
        break;
      query.map(function(p) {
        cells[p].neighbors.forEach(function(e) {
          if (cells[e].used === session)
            return;
          cells[e].used = session;
          if (Math.random() > 0.8)
            return;
          newQuery.push(e);
          heights[e] -= change;
          if (heights[e] < 5 || heights[e] > 100)
            heights[e] = 5;
        });
      });
      query = newQuery.slice();
      newQuery = [];
    }
  }
}

// Modify heights adding or multiplying by value
function modifyHeights(range, add, mult) {
  function modify(v) {
    if (add)
      v += add;
    if (mult !== 1) {
      if (mult === "^2")
        mult = (v - 20) / 100;
      if (mult === "^3")
        mult = ((v - 20) * (v - 20)) / 100;
      if (range === "land") {
        v = 20 + (v - 20) * mult;
      } else {
        v *= mult;
      }
    }
    if (v < 0)
      v = 0;
    if (v > 100)
      v = 100;
    return v;
  }
  const limMin = range === "land" ? 20 : range === "all" ? 0 : +range.split("-")[0];
  const limMax = range === "land" || range === "all" ? 100 : +range.split("-")[1];

  for (let i = 0; i < heights.length; i++) {
    if (heights[i] < limMin || heights[i] > limMax)
      continue;
    heights[i] = modify(heights[i]);
  }
}

// Smooth heights using mean of neighbors
function smoothHeights(fraction) {
  const fr = fraction || 2;
  for (let i = 0; i < heights.length; i++) {
    const nHeights = [heights[i]];
    cells[i].neighbors.forEach(function(e) {
      nHeights.push(heights[e]);
    });
    heights[i] = (heights[i] * (fr - 1) + d3.mean(nHeights)) / fr;
  }
}

// Randomize heights a bit
function disruptHeights() {
  for (let i = 0; i < heights.length; i++) {
    if (heights[i] < 18)
      continue;
    if (Math.random() < 0.5)
      continue;
    heights[i] += 2 - Math.random() * 4;
  }
}
