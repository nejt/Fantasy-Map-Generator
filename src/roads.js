function generateMainRoads() {
    console.time("generateMainRoads");
    lineGen.curve(d3.curveBasis);
    if (states.length < 2 || manors.length < 2) return;
    for (let f = 0; f < features.length; f++) {
      if (!features[f].land) continue;
      const manorsOnIsland = land.filter(function(e) {return e.manor !== undefined && e.fn === f;});
      if (manorsOnIsland.length > 1) {
        for (let d = 1; d < manorsOnIsland.length; d++) {
          for (let m = 0; m < d; m++) {
            const path = findLandPath(manorsOnIsland[d].index, manorsOnIsland[m].index, "main");
            restorePath(manorsOnIsland[m].index, manorsOnIsland[d].index, "main", path);
          }
        }
      }
    }
    console.timeEnd("generateMainRoads");
  }

  // add roads from port to capital if capital is not a port
  function generatePortRoads() {
    console.time("generatePortRoads");
    if (!states.length || manors.length < 2) return;
    const portless = [];
    for (let s=0; s < states.length; s++) {
      const cell = manors[s].cell;
      if (cells[cell].port === undefined) portless.push(s);
    }
    for (let l=0; l < portless.length; l++) {
      const ports = land.filter(function(l) {return l.port !== undefined && l.region === portless[l];});
      if (!ports.length) continue;
      let minDist = 1000, end = -1;
      ports.map(function(p) {
        const dist = Math.hypot(e.data[0] - p.data[0], e.data[1] - p.data[1]);
        if (dist < minDist && dist > 1) {minDist = dist; end = p.index;}
      });
      if (end !== -1) {
        const start = manors[portless[l]].cell;
        const path = findLandPath(start, end, "direct");
        restorePath(end, start, "main", path);
      }
    }
    console.timeEnd("generatePortRoads");
  }

  function generateSmallRoads() {
    console.time("generateSmallRoads");
    if (manors.length < 2) return;
    for (let f = 0; f < features.length; f++) {
      var manorsOnIsland = land.filter(function(e) {return e.manor !== undefined && e.fn === f;});
      var l = manorsOnIsland.length;
      if (l > 1) {
        var secondary = rn((l + 8) / 10);
        for (s = 0; s < secondary; s++) {
          var start = manorsOnIsland[Math.floor(Math.random() * l)].index;
          var end = manorsOnIsland[Math.floor(Math.random() * l)].index;
          var dist = Math.hypot(cells[start].data[0] - cells[end].data[0], cells[start].data[1] - cells[end].data[1]);
          if (dist > 10) {
            var path = findLandPath(start, end, "direct");
            restorePath(end, start, "small", path);
          }
        }
        manorsOnIsland.map(function(e, d) {
          if (!e.path && d > 0) {
            var start = e.index, end = -1;
            var road = land.filter(function(e) {return e.path && e.fn === f;});
            if (road.length > 0) {
              var minDist = 10000;
              road.map(function(i) {
                var dist = Math.hypot(e.data[0] - i.data[0], e.data[1] - i.data[1]);
                if (dist < minDist) {minDist = dist; end = i.index;}
              });
            } else {
              end = manorsOnIsland[0].index;
            }
            var path = findLandPath(start, end, "main");
            restorePath(end, start, "small", path);
          }
        });
      }
    }
    console.timeEnd("generateSmallRoads");
  }

  function generateOceanRoutes() {
    let R = result.achors = []

    console.time("generateOceanRoutes");
    lineGen.curve(d3.curveBasis);
    //TBD Drawing
    //const cAnchors = icons.selectAll("#capital-anchors");
    //const tAnchors = icons.selectAll("#town-anchors");
    const cSize = 2 //cAnchors.attr("size") || 2;
    const tSize = 1 //tAnchors.attr("size") || 1;

    const ports = [];
    // groups all ports on water feature
    for (let m = 0; m < manors.length; m++) {
      const cell = manors[m].cell;
      const port = cells[cell].port;
      if (port === undefined) continue;
      if (ports[port] === undefined) ports[port] = [];
      ports[port].push(cell);

      // draw anchor icon
      const group = m < states.length ? cAnchors : tAnchors;
      const size = m < states.length ? cSize : tSize;
      const x = rn(cells[cell].data[0] - size * 0.47, 2);
      const y = rn(cells[cell].data[1] - size * 0.47, 2);
      // Result for  Drawing
      R.push({
        id: m,
        x: x,
        y: y,
        size : size
      })
    }

    for (let w = 0; w < ports.length; w++) {
      if (!ports[w]) continue;
      if (ports[w].length < 2) continue;
      const onIsland = [];
      for (let i = 0; i < ports[w].length; i++) {
        const cell = ports[w][i];
        const fn = cells[cell].fn;
        if (onIsland[fn] === undefined) onIsland[fn] = [];
        onIsland[fn].push(cell);
      }

      for (let fn = 0; fn < onIsland.length; fn++) {
        if (!onIsland[fn]) continue;
        if (onIsland[fn].length < 2) continue;
        const start = onIsland[fn][0];
        const paths = findOceanPaths(start, -1);

        for (let h=1; h < onIsland[fn].length; h++) {
          // routes from all ports on island to 1st port on island
          restorePath(onIsland[fn][h], start, "ocean", paths);
        }

        // inter-island routes
        for (let c=fn+1; c < onIsland.length; c++) {
          if (!onIsland[c]) continue;
          if (!onIsland[c].length) continue;
          if (onIsland[fn].length > 3) {
            const end = onIsland[c][0];
            restorePath(end, start, "ocean", paths);
          }
        }

        if (features[w].border && !features[fn].border && onIsland[fn].length > 5) {
          // encircle the island
          onIsland[fn].sort(function(a, b) {return cells[b].cost - cells[a].cost;});
          for (let a = 2; a < onIsland[fn].length && a < 10; a++) {
            const from = onIsland[fn][1], to = onIsland[fn][a];
            const dist = Math.hypot(cells[from].data[0] - cells[to].data[0], cells[from].data[1] - cells[to].data[1]);
            const distPath = getPathDist(from, to);
            if (distPath > dist * 4 + 10) {
              const totalCost = cells[from].cost + cells[to].cost;
              const pathsAdd = findOceanPaths(from, to);
              if (cells[to].cost < totalCost) {
                restorePath(to, from, "ocean", pathsAdd);
                break;
              }
            }
          }
        }

      }

    }
    console.timeEnd("generateOceanRoutes");
  }