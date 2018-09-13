// get square grid with some jirrering
function getJitteredGrid(spacing) {
  const radius = spacing / 2;
  // square radius
  const jittering = radius * 0.9;
  // max deviation
  const jitter = function() {
    return Math.random() * 2 * jittering - jittering;
  }
  let points = [];
  for (let y = radius; y < graphHeight; y += spacing) {
    for (let x = radius; x < graphWidth; x += spacing) {
      let xj = rn(x + jitter(), 2);
      let yj = rn(y + jitter(), 2);
      points.push([xj, yj]);
    }
  }
  return points;
}

// Locate points to calculate Voronoi diagram
function placePoints() {
  console.time("placePoints");
  points = [];
  const mod = rn((graphWidth + graphHeight) / 1500, 2);
  // screen size modifier
  const spacing = rn(7.5 * mod / graphSize, 2);
  // space between points before jirrering
  points = getJitteredGrid(spacing);
  heights = new Uint8Array(points.length);
  console.timeEnd("placePoints");
}

// Calculate Voronoi Diagram
function calculateVoronoi(points) {
  console.time("calculateVoronoi");
  diagram = voronoi(points);
  // round edges to simplify future calculations
  diagram.edges.forEach(function(e) {
    e[0][0] = rn(e[0][0], 2);
    e[0][1] = rn(e[0][1], 2);
    e[1][0] = rn(e[1][0], 2);
    e[1][1] = rn(e[1][1], 2);
  });
  polygons = diagram.polygons();
  console.log(" cells: " + points.length);
  console.timeEnd("calculateVoronoi");
}

// turn D3 polygons array into cell array, define neighbors for each cell
function detectNeighbors(withGrid) {
  console.time("detectNeighbors");
  let gridPath = "";
  // store grid as huge single path string
  cells = [];
  polygons.map(function(i, d) {
    const neighbors = [];
    let type;
    // define cell type
    if (withGrid) {
      gridPath += "M" + i.join("L") + "Z";
    }
    // grid path
    diagram.cells[d].halfedges.forEach(function(e) {
      const edge = diagram.edges[e];
      if (edge.left && edge.right) {
        const ea = edge.left.index === d ? edge.right.index : edge.left.index;
        neighbors.push(ea);
      } else {
        type = "border";
        // polygon is on border if it has edge without opposite side polygon
      }
    })
    cells.push({
      index: d,
      data: i.data,
      height: 0,
      type,
      neighbors
    });
  });
  if (withGrid) {
    grid.append("path").attr("d", round(gridPath, 1));
  }
  console.timeEnd("detectNeighbors");
}
