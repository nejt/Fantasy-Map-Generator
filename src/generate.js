//import the scripts we will need
importScripts('../libs/d3.v4.min.js')
importScripts('../libs/d3-scale-chromatic.v1.min.js')
importScripts('../libs/seedrandom.min.js')
importScripts('../libs/priority-queue.min.js')
//local generators
importScripts('../src/names.js')
importScripts('../src/voronoi.js')
importScripts('../src/defineHeightmap.js')
importScripts('../src/flux.js')
importScripts('../src/cultures.js')

// main data variables
var seed, params, voronoi, diagram, polygons, points = [], heights;
// Common variables
var modules = {}, customization = 0, history = [], historyStage = 0, elSelected, 
  autoResize = true, graphSize = 1, cells = [], land = [], riversData = [], manors = [], 
  states = [], features = [], queue = [], 
  fonts = ["Almendra+SC", "Georgia", "Times+New+Roman", "Comic+Sans+MS", "Lucida+Sans+Unicode", "Courier+New"];
//map values
let graphWidth = null
let graphHeight = null
// Color schemes
  var color = d3.scaleSequential(d3.interpolateSpectral),
      colors8 = d3.scaleOrdinal(d3.schemeSet2),
      colors20 = d3.scaleOrdinal(d3.schemeCategory20);

//handle result
let result = {}

// apply default namesbase on load - pulled from names.js
applyNamesData() 

/*
applyDefaultStyle();
// apply style on load
focusOn();
// based on searchParams focus on point, cell or burg from MFCG
invokeActiveZooming();
// to hide what need to be hidden
*/

// randomize options if randomization is allowed in option
let options = { 
    regions : {
      locked : false,
      input : null,
      output : null
    },
    manors : {
      locked : false,
      input : null,
      output : null
    },
    power : {
      locked : false,
      input : null,
      output : null
    },
    neutral : {
      locked : false,
      input : null,
      output : null
    },
    names : {
      locked : false,
      input : null,
      output : null
    },
    cultures : {
      locked : false,
      input : null,
      output : null
    },
    prec : {
      locked : false,
      input : null,
      output : null
    },
    swampiness : {
      locked : false,
      input : null,
      output : null
    },
    heightmapTemplate : {
      locked : false,
      input : null,
    },
    outlineLayers : {
      input : "-6,-3,-1"
    }
  }

function randomizeOptions() {
  let o = options
  const mod = rn((graphWidth + graphHeight) / 1500, 2);
  // add mod for big screens
  if (!o.regions.locked)
    o.regions.input = o.regions.output = rand(7, 17);
  if (!o.manors.locked) {
    const manors = o.regions.input * 20 + rand(180 * mod);
    o.manors.input = o.manors.output = manors;
  }
  if (!o.power.locked)
    o.power.input = o.power.output = rand(2, 8);
  if (!o.neutral.locked)
    o.neutral.input = o.neutral.output = rand(100, 300);
  if (!o.names.locked)
    o.names.input = o.names.output = rand(0, 1);
  if (!o.cultures.locked)
    o.cultures.input = o.cultures.output = rand(5, 10);
  if (!o.prec.locked)
    o.prec.input = o.prec.output = rand(3, 12);
  if (!o.swampiness.locked)
    o.swampiness.input = o.swampiness.output = rand(100);
}

// Mark features (ocean, lakes, islands)
function markFeatures() {
  console.time("markFeatures");
  Math.seedrandom(seed);
  // reset seed to get the same result on heightmap edit
  for (let i = 0, queue = [0]; queue.length > 0; i++) {
    const cell = cells[queue[0]];
    cell.fn = i;
    // feature number
    const land = heights[queue[0]] >= 20;
    let border = cell.type === "border";
    if (border && land)
      cell.ctype = 2;

    while (queue.length) {
      const q = queue.pop();
      if (cells[q].type === "border") {
        border = true;
        if (land)
          cells[q].ctype = 2;
      }

      cells[q].neighbors.forEach(function(e) {
        const eLand = heights[e] >= 20;
        if (land === eLand && cells[e].fn === undefined) {
          cells[e].fn = i;
          queue.push(e);
        }
        if (land && !eLand) {
          cells[q].ctype = 2;
          cells[e].ctype = -1;
          cells[q].harbor = cells[q].harbor ? cells[q].harbor + 1 : 1;
        }
      });
    }
    features.push({
      i,
      land,
      border
    });

    // find unmarked cell
    for (let c = 0; c < cells.length; c++) {
      if (cells[c].fn === undefined) {
        queue[0] = c;
        break;
      }
    }
  }
  console.timeEnd("markFeatures");
}

function setOcean() {
  //update result
  result.ocean = {
    path : [],
    opacity : []
  }

  console.time("setOcean");
  let limits = [];
  let odd = 0.8;
  // initial odd for ocean layer is 80%
  // Define type of ocean cells based on cell distance form land
  let frontier = cells.filter(function(e) {
    return e.ctype === -1;
  });
  if (Math.random() < odd) {
    limits.push(-1);
    odd = 0.2;
  }
  for (let c = -2; frontier.length > 0 && c > -10; c--) {
    if (Math.random() < odd) {
      limits.unshift(c);
      odd = 0.2;
    } else {
      odd += 0.2;
    }
    frontier.map(function(i) {
      i.neighbors.forEach(function(e) {
        if (!cells[e].ctype)
          cells[e].ctype = c;
      });
    });
    frontier = cells.filter(function(e) {
      return e.ctype === c;
    });
  }
  if (options.outlineLayers.input === "none")
    return;
  if (options.outlineLayers.input !== "random")
    limits = options.outlineLayers.input.split(",");
  // Define area edges
  const opacity = rn(0.4 / limits.length, 2);
  for (let l = 0; l < limits.length; l++) {
    const edges = [];
    const lim = +limits[l];
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].ctype < lim || cells[i].ctype === undefined)
        continue;
      if (cells[i].ctype > lim && cells[i].type !== "border")
        continue;
      const cell = diagram.cells[i];
      cell.halfedges.forEach(function(e) {
        const edge = diagram.edges[e];
        const start = edge[0].join(" ");
        const end = edge[1].join(" ");
        if (edge.left && edge.right) {
          const ea = edge.left.index === i ? edge.right.index : edge.left.index;
          if (cells[ea].ctype < lim)
            edges.push({
              start,
              end
            });
        } else {
          edges.push({
            start,
            end
          });
        }
      });
    }
    lineGen.curve(d3.curveBasis);
    let relax = 0.8 - l / 10;
    if (relax < 0.2)
      relax = 0.2;
    
    //update result
    result.ocean.path.push(getContinuousLine(edges, 0, relax)) //line
    result.ocean.opacity.push(opacity)
  }
  console.timeEnd("setOcean");
}

// temporary elevate lakes to min neighbors heights to correctly flux the water
function elevateLakes() {
  console.time('elevateLakes');
  const lakes = cells.filter(function(e, d) {
    return heights[d] < 20 && !features[e.fn].border;
  });
  lakes.sort(function(a, b) {
    return heights[b.index] - heights[a.index];
  });
  for (let i = 0; i < lakes.length; i++) {
    const hs = []
      , id = lakes[i].index;
    cells[id].height = heights[id];
    // use height on object level
    lakes[i].neighbors.forEach(function(n) {
      const nHeight = cells[n].height || heights[n];
      if (nHeight >= 20)
        hs.push(nHeight);
    });
    if (hs.length)
      cells[id].height = d3.min(hs) - 1;
    if (cells[id].height < 20)
      cells[id].height = 20;
    lakes[i].lake = 1;
  }
  console.timeEnd('elevateLakes');
}

// Depression filling algorithm (for a correct water flux modeling; phase1)
function resolveDepressionsPrimary() {
  console.time('resolveDepressionsPrimary');
  land = cells.filter(function(e, d) {
    if (!e.height)
      e.height = heights[d];
    // use height on object level
    return e.height >= 20;
  });
  land.sort(function(a, b) {
    return b.height - a.height;
  });
  const limit = 10;
  for (let l = 0, depression = 1; depression > 0 && l < limit; l++) {
    depression = 0;
    for (let i = 0; i < land.length; i++) {
      const id = land[i].index;
      if (land[i].type === "border")
        continue;
      const hs = land[i].neighbors.map(function(n) {
        return cells[n].height;
      });
      const minHigh = d3.min(hs);
      if (cells[id].height <= minHigh) {
        depression++;
        land[i].pit = land[i].pit ? land[i].pit + 1 : 1;
        cells[id].height = minHigh + 2;
      }
    }
    if (l === 0)
      console.log(" depressions init: " + depression);
  }
  console.timeEnd('resolveDepressionsPrimary');
}

// recalculate Voronoi Graph to pack cells
function reGraph() {
  console.time("reGraph");
  const tempCells = []
    , newPoints = [];
  // to store new data
  // get average precipitation based on graph size
  const avPrec = options.prec.input / 5000;
  const smallLakesMax = 500;
  let smallLakes = 0;
  const evaporation = 2;
  cells.map(function(i, d) {
    let height = i.height || heights[d];
    if (height > 100)
      height = 100;
    const pit = i.pit;
    const ctype = i.ctype;
    if (ctype !== -1 && ctype !== -2 && height < 20)
      return;
    // exclude all deep ocean points
    const x = rn(i.data[0], 1)
      , y = rn(i.data[1], 1);
    const fn = i.fn;
    const harbor = i.harbor;
    let lake = i.lake;
    // mark potential cells for small lakes to add additional point there
    if (smallLakes < smallLakesMax && !lake && pit > evaporation && ctype !== 2) {
      lake = 2;
      smallLakes++;
    }
    const region = i.region;
    // handle value for edit heightmap mode only
    const culture = i.culture;
    // handle value for edit heightmap mode only
    let copy = newPoints.filter(function(e) {
      return (e[0] == x && e[1] == y);
    });
    if (!copy.length) {
      newPoints.push([x, y]);
      tempCells.push({
        index: tempCells.length,
        data: [x, y],
        height,
        pit,
        ctype,
        fn,
        harbor,
        lake,
        region,
        culture
      });
    }
    // add additional points for cells along coast
    if (ctype === 2 || ctype === -1) {
      if (i.type === "border")
        return;
      if (!features[fn].land && !features[fn].border)
        return;
      i.neighbors.forEach(function(e) {
        if (cells[e].ctype === ctype) {
          let x1 = (x * 2 + cells[e].data[0]) / 3;
          let y1 = (y * 2 + cells[e].data[1]) / 3;
          x1 = rn(x1, 1),
          y1 = rn(y1, 1);
          copy = newPoints.filter(function(e) {
            return e[0] === x1 && e[1] === y1;
          });
          if (copy.length)
            return;
          newPoints.push([x1, y1]);
          tempCells.push({
            index: tempCells.length,
            data: [x1, y1],
            height,
            pit,
            ctype,
            fn,
            harbor,
            lake,
            region,
            culture
          });
        }
        ;
      });
    }
    if (lake === 2) {
      // add potential small lakes
      polygons[i.index].forEach(function(e) {
        if (Math.random() > 0.8)
          return;
        let rnd = Math.random() * 0.6 + 0.8;
        const x1 = rn((e[0] * rnd + i.data[0]) / (1 + rnd), 2);
        rnd = Math.random() * 0.6 + 0.8;
        const y1 = rn((e[1] * rnd + i.data[1]) / (1 + rnd), 2);
        copy = newPoints.filter(function(c) {
          return x1 === c[0] && y1 === c[1];
        });
        if (copy.length)
          return;
        newPoints.push([x1, y1]);
        tempCells.push({
          index: tempCells.length,
          data: [x1, y1],
          height,
          pit,
          ctype,
          fn,
          region,
          culture
        });
      });
    }
  });
  console.log("small lakes candidates: " + smallLakes);
  cells = tempCells;
  // use tempCells as the only cells array
  calculateVoronoi(newPoints);
  // recalculate Voronoi diagram using new points
  let gridPath = "";
  // store grid as huge single path string
  cells.map(function(i, d) {
    if (i.height >= 20) {
      // calc cell area
      i.area = rn(Math.abs(d3.polygonArea(polygons[d])), 2);
      const prec = rn(avPrec * i.area, 2);
      i.flux = i.lake ? prec * 10 : prec;
    }
    const neighbors = [];
    // re-detect neighbors
    diagram.cells[d].halfedges.forEach(function(e) {
      const edge = diagram.edges[e];
      if (edge.left === undefined || edge.right === undefined) {
        if (i.height >= 20)
          i.ctype = 99;
        // border cell
        return;
      }
      const ea = edge.left.index === d ? edge.right.index : edge.left.index;
      neighbors.push(ea);
      if (d < ea && i.height >= 20 && i.lake !== 1 && cells[ea].height >= 20 && cells[ea].lake !== 1) {
        gridPath += "M" + edge[0][0] + "," + edge[0][1] + "L" + edge[1][0] + "," + edge[1][1];
      }
    });
    i.neighbors = neighbors;
    if (i.region === undefined)
      delete i.region;
    if (i.culture === undefined)
      delete i.culture;
  });
  //Update result for later drawing
  result.grid = {
    path : gridPath
  }
  console.timeEnd("reGraph");
}

// Depression filling algorithm (for a correct water flux modeling; phase2)
function resolveDepressionsSecondary() {
  console.time('resolveDepressionsSecondary');
  land = cells.filter(function(e) {
    return e.height >= 20;
  });
  land.sort(function(a, b) {
    return b.height - a.height;
  });
  const limit = 100;
  for (let l = 0, depression = 1; depression > 0 && l < limit; l++) {
    depression = 0;
    for (let i = 0; i < land.length; i++) {
      if (land[i].ctype === 99)
        continue;
      const nHeights = land[i].neighbors.map(function(n) {
        return cells[n].height
      });
      const minHigh = d3.min(nHeights);
      if (land[i].height <= minHigh) {
        depression++;
        land[i].pit = land[i].pit ? land[i].pit + 1 : 1;
        land[i].height = Math.trunc(minHigh + 2);
      }
    }
    if (l === 0)
      console.log(" depressions reGraphed: " + depression);
    if (l === limit - 1)
      console.error("Error: resolveDepressions iteration limit");
  }
  console.timeEnd('resolveDepressionsSecondary');
}

// clean data to get rid of redundand info
  function cleanData() {
    console.time("cleanData");
    cells.map(function(c) {
      delete c.cost;
      delete c.used;
      delete c.coastX;
      delete c.coastY;
      if (c.ctype === undefined) delete c.ctype;
      if (c.lake === undefined) delete c.lake;
      c.height = Math.trunc(c.height);
      if (c.height >= 20) c.flux = rn(c.flux, 2);
    });
    // restore layers if they was turned on
    //if (!$("#toggleHeight").hasClass("buttonoff") && !terrs.selectAll("path").size()) toggleHeight();
    //if (!$("#toggleCultures").hasClass("buttonoff") && !cults.selectAll("path").size()) toggleCultures();
    //closeDialogs();
    //invokeActiveZooming();
    console.timeEnd("cleanData");
  }


function generate() {
  console.group("Random map");
  console.time("TOTAL");
  //set the voronoi bounds
  // set extent to map borders + 100px to get infinity world reception
  voronoi = d3.voronoi().extent([[-1, -1], [graphWidth + 1, graphHeight + 1]]);
  //randomize the options 
  randomizeOptions()
  //begin voronoi
  placePoints()
  calculateVoronoi(points)
  detectNeighbors()
  //move to making land
  defineHeightmap()
  markFeatures()
  //water
  setOcean()
  elevateLakes()
  //depressions
  resolveDepressionsPrimary()
  reGraph()
  resolveDepressionsSecondary()
  //flux and water
  flux()
  addLakes()
  //cultures
  generateCultures()
  manorsAndRegions()
  //clean
  cleanData()
  console.timeEnd("TOTAL");
  console.groupEnd("Random map");
}

//HELPER FUNCTIONS
// D3 Line generator variables
  var lineGen = d3.line().x(function(d) {return d.scX;}).y(function(d) {return d.scY;}).curve(d3.curveCatmullRom);

  function getContinuousLine(edges, indention, relax) {
    let line = "";
    if (edges.length < 3) return "";
    while (edges.length > 2) {
      let edgesOrdered = []; // to store points in a correct order
      let start = edges[0].start;
      let end = edges[0].end;
      edges.shift();
      let spl = start.split(" ");
      edgesOrdered.push({scX: +spl[0], scY: +spl[1]});
      spl = end.split(" ");
      edgesOrdered.push({scX: +spl[0], scY: +spl[1]});
      let x0 = +spl[0], y0 = +spl[1];
      for (let i = 0; end !== start && i < 100000; i++) {
        let next = null, index = null;
        for (let e = 0; e < edges.length; e++) {
          const edge = edges[e];
          if (edge.start == end || edge.end == end) {
            next = edge;
            end = next.start == end ? next.end : next.start;
            index = e;
            break;
          }
        }
        if (!next) {
          console.error("Next edge is not found");
          return "";
        }
        spl = end.split(" ");
        if (indention || relax) {
          const dist = Math.hypot(+spl[0] - x0, +spl[1] - y0);
          if (dist >= indention && Math.random() > relax) {
            edgesOrdered.push({scX: +spl[0], scY: +spl[1]});
            x0 = +spl[0], y0 = +spl[1];
          }
        } else {
          edgesOrdered.push({scX: +spl[0], scY: +spl[1]});
        }
        edges.splice(index, 1);
        if (i === 100000-1) {
          console.error("Line not ended, limit reached");
          break;
        }
      }
      line += lineGen(edgesOrdered);
    }
    return round(line, 1);
  }

// random number in a range
  function rand(min, max) {
    if (min === undefined && !max === undefined) return Math.random();
    if (max === undefined) {max = min; min = 0;}
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

// round value to d decimals
function rn(v, d) {
  var d = d || 0;
  var m = Math.pow(10, d);
  return Math.round(v * m) / m;
}

// round string to d decimals
  function round(s, d) {
     var d = d || 1;
     return s.replace(/[\d\.-][\d\.e-]*/g, function(n) {return rn(n, d);})
  }

onmessage = function(e) {
  console.log('WebWorker generating')
  cells = [], land = [], riversData = [], manors = [], states = [], features = [], queue = [];
  let data = e.data
  //set graph
  graphWidth = data.graphWidth
  graphHeight = data.graphHeight
  //set seed
  seed = data.seed || Math.floor(Math.random() * 1e9)
  console.log(" seed: " + seed)
  //seed math random
  Math.seedrandom(seed)
  // generate map on load
  generate()
  //update result
  result.points = points
  result.regions = options.regions.input
  result.land = land
  result.cells = cells
  result.diagram = diagram
  result.features = features
  result.polygons = polygons
  //cultures
  result.cultures = cultures
  result.manors = manors
  result.states = states
  //routes
  result.routes = {
    roads : roads, 
    trails : trails, 
    searoutes : searoutes
  }
  //return
  postMessage(result)
}
