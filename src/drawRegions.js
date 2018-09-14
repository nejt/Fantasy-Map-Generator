// D3 Line generator variables
var lineGen = d3.line().x(function(d) {return d.scX;}).y(function(d) {return d.scY;}).curve(d3.curveCatmullRom);

// Define areas cells
function drawRegions(cells, polygons, states, diagram, manors, labels, regions, borders) {
  console.time('drawRegions');
  labels.select("#countries").selectAll("*").remove();

  // arrays to store edge data
  const edges = []
    , coastalEdges = []
    , borderEdges = []
    , neutralEdges = [];
  for (let a = 0; a < states.length; a++) {
    edges[a] = [];
    coastalEdges[a] = [];
  }
  const e = diagram.edges;
  for (let i = 0; i < e.length; i++) {
    if (e[i] === undefined)
      continue;
    const start = e[i][0].join(" ");
    const end = e[i][1].join(" ");
    const p = {
      start,
      end
    };
    if (e[i].left === undefined) {
      const r = e[i].right.index;
      const rr = cells[r].region;
      if (Number.isInteger(rr))
        edges[rr].push(p);
      continue;
    }
    if (e[i].right === undefined) {
      const l = e[i].left.index;
      const lr = cells[l].region;
      if (Number.isInteger(lr))
        edges[lr].push(p);
      continue;
    }
    const l = e[i].left.index;
    const r = e[i].right.index;
    const lr = cells[l].region;
    const rr = cells[r].region;
    if (lr === rr)
      continue;
    if (Number.isInteger(lr)) {
      edges[lr].push(p);
      if (rr === undefined) {
        coastalEdges[lr].push(p);
      } else if (rr === "neutral") {
        neutralEdges.push(p);
      }
    }
    if (Number.isInteger(rr)) {
      edges[rr].push(p);
      if (lr === undefined) {
        coastalEdges[rr].push(p);
      } else if (lr === "neutral") {
        neutralEdges.push(p);
      } else if (Number.isInteger(lr)) {
        borderEdges.push(p);
      }
    }
  }
  edges.map(function(e, i) {
    if (e.length) {
      drawRegion(e, i, polygons, states, manors, labels, regions);
      drawRegionCoast(coastalEdges[i], i, states, regions);
    }
  });
  drawBorders(borderEdges, "state", borders);
  drawBorders(neutralEdges, "neutral", borders);
  console.timeEnd('drawRegions');
}

function drawRegion(edges, region, polygons, states, manors, labels, regions) {
  var path = ""
    , array = [];
  lineGen.curve(d3.curveLinear);
  while (edges.length > 2) {
    var edgesOrdered = [];
    // to store points in a correct order
    var start = edges[0].start;
    var end = edges[0].end;
    edges.shift();
    var spl = start.split(" ");
    edgesOrdered.push({
      scX: spl[0],
      scY: spl[1]
    });
    spl = end.split(" ");
    edgesOrdered.push({
      scX: spl[0],
      scY: spl[1]
    });
    for (let i = 0; end !== start && i < 2000; i++) {
      var next = $.grep(edges, function(e) {
        return (e.start == end || e.end == end);
      });
      if (next.length > 0) {
        if (next[0].start == end) {
          end = next[0].end;
        } else if (next[0].end == end) {
          end = next[0].start;
        }
        spl = end.split(" ");
        edgesOrdered.push({
          scX: spl[0],
          scY: spl[1]
        });
      }
      var rem = edges.indexOf(next[0]);
      edges.splice(rem, 1);
    }
    path += lineGen(edgesOrdered) + "Z ";
    array[array.length] = edgesOrdered.map(function(e) {
      return [+e.scX, +e.scY];
    });
  }
  var color = states[region].color;
  regions.append("path").attr("d", round(path, 1)).attr("fill", color).attr("class", "region" + region);
  array.sort(function(a, b) {
    return b.length - a.length;
  });
  let capital = states[region].capital;
  // add capital cell as a hole
  if (!isNaN(capital)) {
    const capitalCell = manors[capital].cell;
    array.push(polygons[capitalCell]);
  }
  var name = states[region].name;
  var c = polylabel(array, 1.0);
  // pole of inaccessibility
  labels.select("#countries").append("text").attr("id", "regionLabel" + region).attr("x", rn(c[0])).attr("y", rn(c[1])).text(name);
  states[region].area = rn(Math.abs(d3.polygonArea(array[0])));
  // define region area
}

function drawRegionCoast(edges, region, states, regions) {
  var path = "";
  while (edges.length > 0) {
    var edgesOrdered = [];
    // to store points in a correct order
    var start = edges[0].start;
    var end = edges[0].end;
    edges.shift();
    var spl = start.split(" ");
    edgesOrdered.push({
      scX: spl[0],
      scY: spl[1]
    });
    spl = end.split(" ");
    edgesOrdered.push({
      scX: spl[0],
      scY: spl[1]
    });
    var next = $.grep(edges, function(e) {
      return (e.start == end || e.end == end);
    });
    while (next.length > 0) {
      if (next[0].start == end) {
        end = next[0].end;
      } else if (next[0].end == end) {
        end = next[0].start;
      }
      spl = end.split(" ");
      edgesOrdered.push({
        scX: spl[0],
        scY: spl[1]
      });
      var rem = edges.indexOf(next[0]);
      edges.splice(rem, 1);
      next = $.grep(edges, function(e) {
        return (e.start == end || e.end == end);
      });
    }
    path += lineGen(edgesOrdered);
  }
  var color = states[region].color;
  regions.append("path").attr("d", round(path, 1)).attr("fill", "none").attr("stroke", color).attr("stroke-width", 5).attr("class", "region" + region);
}

function drawBorders(edges, type, borders) {
  var path = "";
  if (edges.length < 1) {
    return;
  }
  while (edges.length > 0) {
    var edgesOrdered = [];
    // to store points in a correct order
    var start = edges[0].start;
    var end = edges[0].end;
    edges.shift();
    var spl = start.split(" ");
    edgesOrdered.push({
      scX: spl[0],
      scY: spl[1]
    });
    spl = end.split(" ");
    edgesOrdered.push({
      scX: spl[0],
      scY: spl[1]
    });
    var next = $.grep(edges, function(e) {
      return (e.start == end || e.end == end);
    });
    while (next.length > 0) {
      if (next[0].start == end) {
        end = next[0].end;
      } else if (next[0].end == end) {
        end = next[0].start;
      }
      spl = end.split(" ");
      edgesOrdered.push({
        scX: spl[0],
        scY: spl[1]
      });
      var rem = edges.indexOf(next[0]);
      edges.splice(rem, 1);
      next = $.grep(edges, function(e) {
        return (e.start == end || e.end == end);
      });
    }
    path += lineGen(edgesOrdered);
  }
  if (type === "state") {
    borders.state.append("path").attr("d", round(path, 1));
  }
  if (type === "neutral") {
    borders.neutral.append("path").attr("d", round(path, 1));
  }
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

export {drawRegions}; 