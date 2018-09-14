// Detect and draw the coasline

function drawCoastline(lineGen, seed, width, height, cells, features, land, diagram, defs, lakes, landmass, coastline, ruler) {
  console.time('drawCoastline');
  Math.seedrandom(seed);
  // reset seed to get the same result on heightmap edit
  const shape = defs.append("mask").attr("id", "shape").attr("fill", "black").attr("x", 0).attr("y", 0).attr("width", "100%").attr("height", "100%");
  $("#landmass").empty();
  let minX = width
    , maxX = 0;
  // extreme points
  let minXedge, maxXedge;
  // extreme edges
  const oceanEdges = []
    , lakeEdges = [];
  for (let i = 0; i < land.length; i++) {
    const id = land[i].index
      , cell = diagram.cells[id];
    const f = land[i].fn;
    land[i].height = Math.trunc(land[i].height);
    if (!oceanEdges[f]) {
      oceanEdges[f] = [];
      lakeEdges[f] = [];
    }
    cell.halfedges.forEach(function(e) {
      const edge = diagram.edges[e];
      const start = edge[0].join(" ");
      const end = edge[1].join(" ");
      if (edge.left && edge.right) {
        const ea = edge.left.index === id ? edge.right.index : edge.left.index;
        cells[ea].height = Math.trunc(cells[ea].height);
        if (cells[ea].height < 20) {
          cells[ea].ctype = -1;
          if (land[i].ctype !== 1) {
            land[i].ctype = 1;
            // mark coastal land cells
            // move cell point closer to coast
            const x = (land[i].data[0] + cells[ea].data[0]) / 2;
            const y = (land[i].data[1] + cells[ea].data[1]) / 2;
            land[i].haven = ea;
            // harbor haven (oposite water cell)
            land[i].coastX = rn(x + (land[i].data[0] - x) * 0.1, 1);
            land[i].coastY = rn(y + (land[i].data[1] - y) * 0.1, 1);
            land[i].data[0] = rn(x + (land[i].data[0] - x) * 0.5, 1);
            land[i].data[1] = rn(y + (land[i].data[1] - y) * 0.5, 1);
          }
          if (features[cells[ea].fn].border) {
            oceanEdges[f].push({
              start,
              end
            });
            // island extreme points
            if (edge[0][0] < minX) {
              minX = edge[0][0];
              minXedge = edge[0]
            }
            if (edge[1][0] < minX) {
              minX = edge[1][0];
              minXedge = edge[1]
            }
            if (edge[0][0] > maxX) {
              maxX = edge[0][0];
              maxXedge = edge[0]
            }
            if (edge[1][0] > maxX) {
              maxX = edge[1][0];
              maxXedge = edge[1]
            }
          } else {
            const l = cells[ea].fn;
            if (!lakeEdges[f][l])
              lakeEdges[f][l] = [];
            lakeEdges[f][l].push({
              start,
              end
            });
          }
        }
      } else {
        oceanEdges[f].push({
          start,
          end
        });
      }
    });
  }

  for (let f = 0; f < features.length; f++) {
    if (!oceanEdges[f])
      continue;
    if (!oceanEdges[f].length && lakeEdges[f].length) {
      const m = lakeEdges[f].indexOf(d3.max(lakeEdges[f]));
      oceanEdges[f] = lakeEdges[f][m];
      lakeEdges[f][m] = [];
    }
    lineGen.curve(d3.curveCatmullRomClosed.alpha(0.1));
    const oceanCoastline = getContinuousLine(lineGen, oceanEdges[f], 3, 0);
    if (oceanCoastline) {
      shape.append("path").attr("d", oceanCoastline).attr("fill", "white");
      // draw the mask
      coastline.append("path").attr("d", oceanCoastline);
      // draw the coastline
    }
    lineGen.curve(d3.curveBasisClosed);
    lakeEdges[f].forEach(function(l) {
      const lakeCoastline = getContinuousLine(lineGen, l, 3, 0);
      if (lakeCoastline) {
        shape.append("path").attr("d", lakeCoastline).attr("fill", "black");
        // draw the mask
        lakes.append("path").attr("d", lakeCoastline);
        // draw the lakes
      }
    });
  }
  landmass.append("rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height);
  // draw the landmass
  return [minXedge, maxXedge];
  //drawDefaultRuler(ruler, minXedge, maxXedge);
  console.timeEnd('drawCoastline');
}

function getContinuousLine(lineGen, edges, indention, relax) {
  let line = "";
  if (edges.length < 3)
    return "";
  while (edges.length > 2) {
    let edgesOrdered = [];
    // to store points in a correct order
    let start = edges[0].start;
    let end = edges[0].end;
    edges.shift();
    let spl = start.split(" ");
    edgesOrdered.push({
      scX: +spl[0],
      scY: +spl[1]
    });
    spl = end.split(" ");
    edgesOrdered.push({
      scX: +spl[0],
      scY: +spl[1]
    });
    let x0 = +spl[0]
      , y0 = +spl[1];
    for (let i = 0; end !== start && i < 100000; i++) {
      let next = null
        , index = null;
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
          edgesOrdered.push({
            scX: +spl[0],
            scY: +spl[1]
          });
          x0 = +spl[0],
          y0 = +spl[1];
        }
      } else {
        edgesOrdered.push({
          scX: +spl[0],
          scY: +spl[1]
        });
      }
      edges.splice(index, 1);
      if (i === 100000 - 1) {
        console.error("Line not ended, limit reached");
        break;
      }
    }
    line += lineGen(edgesOrdered);
  }
  return round(line, 1);
}

// draw default ruler measiring land x-axis edges
  function drawDefaultRuler(ruler, minXedge, maxXedge) {
    const rulerNew = ruler.append("g").attr("class", "linear").call(d3.drag().on("start", elementDrag));
    if (!minXedge) minXedge = [0, 0];
    if (!maxXedge) maxXedge = [svgWidth, svgHeight];
    const x1 = rn(minXedge[0], 2), y1 = rn(minXedge[1], 2), x2 = rn(maxXedge[0], 2), y2 = rn(maxXedge[1], 2);
    rulerNew.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2).attr("class", "white");
    rulerNew.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2).attr("class", "gray").attr("stroke-dasharray", 10);
    rulerNew.append("circle").attr("r", 2).attr("cx", x1).attr("cy", y1).attr("stroke-width", 0.5).attr("data-edge", "left").call(d3.drag().on("drag", rulerEdgeDrag));
    rulerNew.append("circle").attr("r", 2).attr("cx", x2).attr("cy", y2).attr("stroke-width", 0.5).attr("data-edge", "rigth").call(d3.drag().on("drag", rulerEdgeDrag));
    const x0 = rn((x1 + x2) / 2, 2), y0 = rn((y1 + y2) / 2, 2);
    rulerNew.append("circle").attr("r", 1.2).attr("cx", x0).attr("cy", y0).attr("stroke-width", 0.3).attr("class", "center").call(d3.drag().on("start", rulerCenterDrag));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    const tr = "rotate(" + angle + " " + x0 + " " + y0 +")";
    const dist = rn(Math.hypot(x1 - x2, y1 - y2));
    const label = rn(dist * distanceScale.value) + " " + distanceUnit.value;
    rulerNew.append("text").attr("x", x0).attr("y", y0).attr("dy", -1).attr("transform", tr).attr("data-dist", dist).text(label).on("click", removeParent).attr("font-size", 10);
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

export {drawCoastline}; 