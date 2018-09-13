let roads = [], trails = [], searoutes =[];

function findLandPath(start, end, type) {
  // A* algorithm
  var queue = new PriorityQueue({
    comparator: function(a, b) {
      return a.p - b.p
    }
  });
  var cameFrom = [];
  var costTotal = [];
  costTotal[start] = 0;
  queue.queue({
    e: start,
    p: 0
  });
  while (queue.length > 0) {
    var next = queue.dequeue().e;
    if (next === end) {
      break;
    }
    var pol = cells[next];
    pol.neighbors.forEach(function(e) {
      if (cells[e].height >= 20) {
        var cost = cells[e].height / 100 * 2;
        if (cells[e].path && type === "main") {
          cost = 0.15;
        } else {
          if (typeof e.manor === "undefined") {
            cost += 0.1;
          }
          if (typeof e.river !== "undefined") {
            cost -= 0.1;
          }
          if (cells[e].harbor) {
            cost *= 0.3;
          }
          if (cells[e].path) {
            cost *= 0.5;
          }
          cost += Math.hypot(cells[e].data[0] - pol.data[0], cells[e].data[1] - pol.data[1]) / 30;
        }
        var costNew = costTotal[next] + cost;
        if (!cameFrom[e] || costNew < costTotal[e]) {
          //
          costTotal[e] = costNew;
          cameFrom[e] = next;
          var dist = Math.hypot(cells[e].data[0] - cells[end].data[0], cells[e].data[1] - cells[end].data[1]) / 15;
          var priority = costNew + dist;
          queue.queue({
            e,
            p: priority
          });
        }
      }
    });
  }
  return cameFrom;
}

function findLandPaths(start, type) {
  // Dijkstra algorithm (not used now)
  const queue = new PriorityQueue({
    comparator: function(a, b) {
      return a.p - b.p
    }
  });
  const cameFrom = []
    , costTotal = [];
  cameFrom[start] = "no",
  costTotal[start] = 0;
  queue.queue({
    e: start,
    p: 0
  });
  while (queue.length > 0) {
    const next = queue.dequeue().e;
    const pol = cells[next];
    pol.neighbors.forEach(function(e) {
      if (cells[e].height < 20)
        return;
      let cost = cells[e].height / 100 * 2;
      if (e.river !== undefined)
        cost -= 0.2;
      if (pol.region !== cells[e].region)
        cost += 1;
      if (cells[e].region === "neutral")
        cost += 1;
      if (e.manor !== undefined)
        cost = 0.1;
      const costNew = costTotal[next] + cost;
      if (!cameFrom[e]) {
        costTotal[e] = costNew;
        cameFrom[e] = next;
        queue.queue({
          e,
          p: costNew
        });
      }
    });
  }
  return cameFrom;
}

function restorePath(end, start, type, from) {
  var path = []
    , current = end
    , limit = 1000;
  var prev = cells[end];
  if (type === "ocean" || !prev.path) {
    path.push({
      scX: prev.data[0],
      scY: prev.data[1],
      i: end
    });
  }
  if (!prev.path) {
    prev.path = 1;
  }
  for (let i = 0; i < limit; i++) {
    current = from[current];
    var cur = cells[current];
    if (!cur) {
      break;
    }
    if (cur.path) {
      cur.path += 1;
      path.push({
        scX: cur.data[0],
        scY: cur.data[1],
        i: current
      });
      prev = cur;
      drawPath();
    } else {
      cur.path = 1;
      if (prev) {
        path.push({
          scX: prev.data[0],
          scY: prev.data[1],
          i: prev.index
        });
      }
      prev = undefined;
      path.push({
        scX: cur.data[0],
        scY: cur.data[1],
        i: current
      });
    }
    if (current === start || !from[current]) {
      break;
    }
  }

  drawPath();
  function drawPath() {
    if (path.length > 1) {
      // mark crossroades
      if (type === "main" || type === "small") {
        var plus = type === "main" ? 4 : 2;
        var f = cells[path[0].i];
        if (f.path > 1) {
          if (!f.crossroad) {
            f.crossroad = 0;
          }
          f.crossroad += plus;
        }
        var t = cells[(path[path.length - 1].i)];
        if (t.path > 1) {
          if (!t.crossroad) {
            t.crossroad = 0;
          }
          t.crossroad += plus;
        }
      }
      // draw path segments
      var line = lineGen(path);
      line = round(line, 1);
      let id = 0;
      // to create unique route id
      if (type === "main") {
        roads.push({
          id : roads.length,
          d: line
        })
      } else if (type === "small") {
        trails.push({
          id : trails.length,
          d: line
        })
      } else if (type === "ocean") {
        searoutes.push({
          id : searoutes.length,
          d: line
        })
      }
    }
    path = [];
  }
}
