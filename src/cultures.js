importScripts('../src/paths.js')
importScripts('../src/roads.js')

// generate cultures for a new map based on options and namesbase
  function generateCultures() {
    const count = +options.cultures.input;
    cultures = d3.shuffle(defaultCultures).slice(0, count);
    const centers = d3.range(cultures.length).map(function(d, i) {
      const x = Math.floor(Math.random() * graphWidth * 0.8 + graphWidth * 0.1);
      const y = Math.floor(Math.random() * graphHeight * 0.8 + graphHeight * 0.1);
      const center = [x, y];
      cultures[i].center = center;
      return center;
    });
    cultureTree = d3.quadtree(centers);
  }

  function manorsAndRegions() {
    console.group('manorsAndRegions');
    //placing locations
    rankPlacesGeography()
    locateCapitals()
    //roads
    generateMainRoads()
    rankPlacesEconomy()
    locateTowns()
    //getNames()
    shiftSettlements()
    checkAccessibility()
    defineRegions("withCultures")
    //routes and roads 2
    generatePortRoads()
    generateSmallRoads()
    generateOceanRoutes()
    //population
    calculatePopulation()
    console.groupEnd('manorsAndRegions');
  }

  // Assess cells geographycal suitability for settlement
  function rankPlacesGeography() {
    console.time('rankPlacesGeography');
    land.map(function(c) {
      let score = 0;
      c.flux = rn(c.flux, 2);
      // get base score from height (will be biom)
      if (c.height <= 40) score = 2;
      else if (c.height <= 50) score = 1.8;
      else if (c.height <= 60) score = 1.6;
      else if (c.height <= 80) score = 1.4;
      score += (1 - c.height / 100) / 3;
      if (c.ctype && Math.random() < 0.8 && !c.river) {
        c.score = 0; // ignore 80% of extended cells
      } else {
        if (c.harbor) {
          if (c.harbor === 1) {score += 1;} else {score -= 0.3;} // good sea harbor is valued
        }
        if (c.river) score += 1; // coastline is valued
        if (c.river && c.ctype === 1) score += 1; // estuary is valued
        if (c.flux > 1) score += Math.pow(c.flux, 0.3); // riverbank is valued
        if (c.confluence) score += Math.pow(c.confluence, 0.7); // confluence is valued;
        const neighbEv = c.neighbors.map(function(n) {if (cells[n].height >= 20) return cells[n].height;})
        const difEv = c.height - d3.mean(neighbEv);
        // if (!isNaN(difEv)) score += difEv * 10 * (1 - c.height / 100); // local height maximums are valued
      }
      c.score = rn(Math.random() * score + score, 3); // add random factor
    });
    land.sort(function(a, b) {return b.score - a.score;});
    console.timeEnd('rankPlacesGeography');
  }

  function locateCapitals() {
    console.time('locateCapitals');
    // min distance detween capitals
    const count = +options.regions.input;
    let spacing = (graphWidth + graphHeight) / 2 / count;
    console.log(" states: " + count);

    for (let l = 0; manors.length < count; l++) {
      const region = manors.length;
      const x = land[l].data[0], y = land[l].data[1];
      let minDist = 10000; // dummy value
      for (let c = 0; c < manors.length; c++) {
        const dist = Math.hypot(x - manors[c].x, y - manors[c].y);
        if (dist < minDist) minDist = dist;
        if (minDist < spacing) break;
      }
      if (minDist >= spacing) {
        const cell = land[l].index;
        const closest = cultureTree.find(x, y);
        const culture = getCultureId(closest);
        manors.push({i: region, cell, x, y, region, culture});
      }
      if (l === land.length - 1) {
        console.error("Cannot place capitals with current spacing. Trying again with reduced spacing");
        l = -1, manors = [], spacing /= 1.2;
      }
    }

    // For each capital create a country
    const scheme = count <= 8 ? colors8 : colors20;
    const mod = +options.power.input;
    manors.forEach(function(m, i) {
      const power = rn(Math.random() * mod / 2 + 1, 1);
      const color = scheme(i / count);
      states.push({i, color, power, capital: i});
      const p = cells[m.cell];
      p.manor = i;
      p.region = i;
      p.culture = m.culture;
    });
    console.timeEnd('locateCapitals');
  }

  //ROADS is part of roads.js

  // Assess the cells economical suitability for settlement
  function rankPlacesEconomy() {
    console.time('rankPlacesEconomy');
    land.map(function(c) {
      var score = c.score;
      var path = c.path || 0; // roads are valued
      if (path) {
        path = Math.pow(path, 0.2);
        var crossroad = c.crossroad || 0; // crossroads are valued
        score = score + path + crossroad;
      }
      c.score = rn(Math.random() * score + score, 2); // add random factor
    });
    land.sort(function(a, b) {return b.score - a.score;});
    console.timeEnd('rankPlacesEconomy');
  }

  function locateTowns() {
    console.time('locateTowns');
    const count = +options.manors.input;
    const neutral = +options.neutral.input;
    const manorTree = d3.quadtree();
    manors.forEach(function(m) {manorTree.add([m.x, m.y]);});

    for (let l = 0; manors.length < count && l < land.length; l++) {
      const x = land[l].data[0], y = land[l].data[1];
      const c = manorTree.find(x, y);
      const d = Math.hypot(x - c[0], y - c[1]);
      if (d < 6) continue;
      const cell = land[l].index;
      let region = "neutral", culture = -1, closest = neutral;
      for (let c = 0; c < states.length; c++) {
        let dist = Math.hypot(manors[c].x - x, manors[c].y - y) / states[c].power;
        const cap = manors[c].cell;
        if (cells[cell].fn !== cells[cap].fn) dist *= 3;
        if (dist < closest) {region = c; closest = dist;}
      }
      if (closest > neutral / 5 || region === "neutral") {
        const closestCulture = cultureTree.find(x, y);
        culture = getCultureId(closestCulture);
      } else {
        culture = manors[region].culture;
      }
      land[l].manor = manors.length;
      land[l].culture = culture;
      land[l].region = region;
      manors.push({i: manors.length, cell, x, y, region, culture});
      manorTree.add([x, y]);
    }
    if (manors.length < count) {
      const error = "Cannot place all burgs. Requested " + count + ", placed " + manors.length;
      console.error(error);
    }
    console.timeEnd('locateTowns');
  }

  // shift settlements from cell point
  function shiftSettlements() {
    for (let i=0; i < manors.length; i++) {
      const capital = i < options.regions.input;
      const cell = cells[manors[i].cell];
      let x = manors[i].x, y = manors[i].y;
      if ((capital && cell.harbor) || cell.harbor === 1) {
        // port: capital with any harbor and towns with good harbors
        if (cell.haven === undefined) {
          cell.harbor = undefined;
        } else {
          cell.port = cells[cell.haven].fn;
          x = cell.coastX;
          y = cell.coastY;
        }
      }
      if (cell.river && cell.type !== 1) {
        let shift = 0.2 * cell.flux;
        if (shift < 0.2) shift = 0.2;
        if (shift > 1) shift = 1;
        shift = Math.random() > .5 ? shift : shift * -1;
        x = rn(x + shift, 2);
        shift = Math.random() > .5 ? shift : shift * -1;
        y = rn(y + shift, 2);
      }
      cell.data[0] = manors[i].x = x;
      cell.data[1] = manors[i].y = y;
    }
  }

  // Validate each island with manors has port
  function checkAccessibility() {
    console.time("checkAccessibility");
    for (let f = 0; f < features.length; f++) {
      if (!features[f].land) continue;
      var manorsOnIsland = land.filter(function(e) {return e.manor !== undefined && e.fn === f;});
      if (manorsOnIsland.length > 0) {
        var ports = manorsOnIsland.filter(function(p) {return p.port;});
        if (ports.length === 0) {
          var portCandidates = manorsOnIsland.filter(function(c) {return c.harbor && c.ctype === 1;});
          if (portCandidates.length > 0) {
            // No ports on island. Upgrading first burg to port
            const candidate = portCandidates[0];
            candidate.harbor = 1;
            candidate.port = cells[candidate.haven].fn;
            const manor = manors[portCandidates[0].manor];
            candidate.data[0] = manor.x = candidate.coastX;
            candidate.data[1] = manor.y = candidate.coastY;
            // add score for each burg on island (as it's the only port)
            candidate.score += Math.floor((portCandidates.length - 1) / 2);
          } else {
            // No ports on island. Reducing score for burgs
            manorsOnIsland.map(function(e) {e.score -= 2;});
          }
        }
      }
    }
  console.timeEnd("checkAccessibility");
  }

  // Define areas based on the closest manor to a polygon
  function defineRegions(withCultures) {
    console.time('defineRegions');
    const manorTree = d3.quadtree();
    manors.forEach(function(m) {if (m.region !== "removed") manorTree.add([m.x, m.y]);});

    const neutral = +options.neutral.input;
    land.forEach(function(i) {
      if (i.manor !== undefined && manors[i.manor].region !== "removed") {
        i.region = manors[i.manor].region;
        if (withCultures && manors[i.manor].culture !== undefined) i.culture = manors[i.manor].culture;
        return;
      }
      const x = i.data[0], y = i.data[1];

      let dist = 100000, manor = null;
      if (manors.length) {
        const c = manorTree.find(x, y);
        dist = Math.hypot(c[0] - x, c[1] - y);
        manor = getManorId(c);
      }
      if (dist > neutral / 2 || manor === null) {
        i.region = "neutral";
        if (withCultures) {
          const closestCulture = cultureTree.find(x, y);
          i.culture = getCultureId(closestCulture);
        }
      } else {
        const cell = manors[manor].cell;
        if (cells[cell].fn !== i.fn) {
          let minDist = dist * 3;
          land.forEach(function(l) {
            if (l.fn === i.fn && l.manor !== undefined) {
              if (manors[l.manor].region === "removed") return;
              const distN = Math.hypot(l.data[0] - x, l.data[1] - y);
              if (distN < minDist) {minDist = distN; manor = l.manor;}
            }
          });
        }
        i.region = manors[manor].region;
        if (withCultures) i.culture = manors[manor].culture;
      }
    });
    console.timeEnd('defineRegions');
  }

  // calculate population for manors, cells and states
  function calculatePopulation() {
    // neutral population factors < 1 as neutral lands are usually pretty wild
    const ruralFactor = 0.5, urbanFactor = 0.9;

    // calculate population for each burg (based on trade/people attractors)
    manors.map(function(m) {
      var cell = cells[m.cell];
      var score = cell.score;
      if (score <= 0) {score = rn(Math.random(), 2)}
      if (cell.crossroad) {score += cell.crossroad;} // crossroads
      if (cell.confluence) {score += Math.pow(cell.confluence, 0.3);} // confluences
      if (m.i !== m.region && cell.port) {score *= 1.5;} // ports (not capital)
      if (m.i === m.region && !cell.port) {score *= 2;} // land-capitals
      if (m.i === m.region && cell.port) {score *= 3;} // port-capitals
      if (m.region === "neutral") score *= urbanFactor;
      const rnd = 0.6 + Math.random() * 0.8; // random factor
      m.population = rn(score * rnd, 1);
    });

    // calculate rural population for each cell based on area + elevation (elevation to be changed to biome)
    const graphSizeAdj = 90 / Math.sqrt(cells.length, 2); // adjust to different graphSize
    land.map(function(l) {
      let population = 0;
      const elevationFactor = Math.pow(1 - l.height / 100, 3);
      population = elevationFactor * l.area * graphSizeAdj;
      if (l.region === "neutral") population *= ruralFactor;
      l.pop = rn(population, 1);
    });

    // calculate population for each region
    states.map(function(s, i) {
      // define region burgs count
      var burgs = manors.filter(function(e) {return e.region === i;});
      s.burgs = burgs.length;
      // define region total and burgs population
      var burgsPop = 0; // get summ of all burgs population
      burgs.map(function(b) {burgsPop += b.population;});
      s.urbanPopulation = rn(burgsPop, 2);
      var regionCells = cells.filter(function(e) {return e.region === i;});
      let cellsPop = 0;
      regionCells.map(function(c) {cellsPop += c.pop});
      s.cells = regionCells.length;
      s.ruralPopulation = rn(cellsPop, 1);
    });

    // collect data for neutrals
    const neutralCells = cells.filter(function(e) {return e.region === "neutral";});
    if (neutralCells.length) {
      let burgs = 0, urbanPopulation = 0, ruralPopulation = 0, area = 0;
      manors.forEach(function(m) {
        if (m.region !== "neutral") return;
        urbanPopulation += m.population;
        burgs++;
      });
      neutralCells.forEach(function(c) {
        ruralPopulation += c.pop;
        area += cells[c.index].area;
      });
      states.push({i: states.length, color: "neutral", name: "Neutrals", capital: "neutral",
        cells: neutralCells.length, burgs, urbanPopulation: rn(urbanPopulation, 2),
        ruralPopulation: rn(ruralPopulation, 2), area: rn(area)});
    }
  }

  // get culture Id from center coordinates
  function getCultureId(c) {
    for (let i=0; i < cultures.length; i++) {
      if (cultures[i].center[0] === c[0]) if (cultures[i].center[1] === c[1]) return i;
    }
  }

  // get manor Id from center coordinates
  function getManorId(c) {
    for (let i=0; i < manors.length; i++) {
      if (manors[i].x === c[0]) if (manors[i].y === c[1]) return i;
    }
  }