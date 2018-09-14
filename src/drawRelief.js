import {toHEX,rand,rn,round,si,getInteger,normalize} from "./basicFn.js" 

// Draw the Relief (need to create more beautiness)
function drawRelief(terrain, land, polygons, cells, options) {
  console.time('drawRelief');
  let h, count, rnd, cx, cy, swampCount = 0;
  const hills = terrain.select("#hills");
  const mounts = terrain.select("#mounts");
  const swamps = terrain.select("#swamps");
  const forests = terrain.select("#forests");
  terrain.selectAll("g").selectAll("g").remove();
  // sort the land to Draw the top element first (reduce the elements overlapping)
  land.sort(compareY);
  for (let i = 0; i < land.length; i++) {
    if (land[i].river)
      continue;
    // no icons on rivers
    const cell = land[i].index;
    const p = d3.polygonCentroid(polygons[cell]);
    // polygon centroid point
    if (p === undefined)
      continue;
    // something is wrong with data
    const height = land[i].height;
    const area = land[i].area;
    if (height >= 70) {
      // mount icon
      h = (height - 55) * 0.12;
      for (let c = 0, a = area; Math.random() < a / 50; c++,
      a -= 50) {
        if (polygons[cell][c] === undefined)
          break;
        const g = mounts.append("g");
        if (c < 2) {
          cx = p[0] - h / 100 * (1 - c / 10) - c * 2;
          cy = p[1] + h / 400 + c;
        } else {
          const p2 = polygons[cell][c];
          cx = (p[0] * 1.2 + p2[0] * 0.8) / 2;
          cy = (p[1] * 1.2 + p2[1] * 0.8) / 2;
        }
        rnd = Math.random() * 0.8 + 0.2;
        let mount = "M" + cx + "," + cy + " L" + (cx + h / 3 + rnd) + "," + (cy - h / 4 - rnd * 1.2) + " L" + (cx + h / 1.1) + "," + (cy - h) + " L" + (cx + h + rnd) + "," + (cy - h / 1.2 + rnd) + " L" + (cx + h * 2) + "," + cy;
        let shade = "M" + cx + "," + cy + " L" + (cx + h / 3 + rnd) + "," + (cy - h / 4 - rnd * 1.2) + " L" + (cx + h / 1.1) + "," + (cy - h) + " L" + (cx + h / 1.5) + "," + cy;
        let dash = "M" + (cx - 0.1) + "," + (cy + 0.3) + " L" + (cx + 2 * h + 0.1) + "," + (cy + 0.3);
        dash += "M" + (cx + 0.4) + "," + (cy + 0.6) + " L" + (cx + 2 * h - 0.3) + "," + (cy + 0.6);
        g.append("path").attr("d", round(mount, 1)).attr("stroke", "#5c5c70");
        g.append("path").attr("d", round(shade, 1)).attr("fill", "#999999");
        g.append("path").attr("d", round(dash, 1)).attr("class", "strokes");
      }
    } else if (height > 50) {
      // hill icon
      h = (height - 40) / 10;
      if (h > 1.7)
        h = 1.7;
      for (let c = 0, a = area; Math.random() < a / 30; c++,
      a -= 30) {
        if (land[i].ctype === 1 && c > 0)
          break;
        if (polygons[cell][c] === undefined)
          break;
        const g = hills.append("g");
        if (c < 2) {
          cx = p[0] - h - c * 1.2;
          cy = p[1] + h / 4 + c / 1.6;
        } else {
          const p2 = polygons[cell][c];
          cx = (p[0] * 1.2 + p2[0] * 0.8) / 2;
          cy = (p[1] * 1.2 + p2[1] * 0.8) / 2;
        }
        let hill = "M" + cx + "," + cy + " Q" + (cx + h) + "," + (cy - h) + " " + (cx + 2 * h) + "," + cy;
        let shade = "M" + (cx + 0.6 * h) + "," + (cy + 0.1) + " Q" + (cx + h * 0.95) + "," + (cy - h * 0.91) + " " + (cx + 2 * h * 0.97) + "," + cy;
        let dash = "M" + (cx - 0.1) + "," + (cy + 0.2) + " L" + (cx + 2 * h + 0.1) + "," + (cy + 0.2);
        dash += "M" + (cx + 0.4) + "," + (cy + 0.4) + " L" + (cx + 2 * h - 0.3) + "," + (cy + 0.4);
        g.append("path").attr("d", round(hill, 1)).attr("stroke", "#5c5c70");
        g.append("path").attr("d", round(shade, 1)).attr("fill", "white");
        g.append("path").attr("d", round(dash, 1)).attr("class", "strokes");
      }
    }

    // swamp icons
    if (height >= 21 && height < 22 && swampCount < options.swampiness.input && land[i].used != 1) {
      const g = swamps.append("g");
      swampCount++;
      land[i].used = 1;
      let swamp = drawSwamp(p[0], p[1]);
      land[i].neighbors.forEach(function(e) {
        if (cells[e].height >= 20 && cells[e].height < 30 && !cells[e].river && cells[e].used != 1) {
          cells[e].used = 1;
          swamp += drawSwamp(cells[e].data[0], cells[e].data[1]);
        }
      })
      g.append("path").attr("d", round(swamp, 1));
    }

    // forest icons
    if (Math.random() < height / 100 && height >= 22 && height < 48) {
      for (let c = 0, a = area; Math.random() < a / 15; c++,
      a -= 15) {
        if (land[i].ctype === 1 && c > 0)
          break;
        if (polygons[cell][c] === undefined)
          break;
        const g = forests.append("g");
        if (c === 0) {
          cx = rn(p[0] - 1 - Math.random(), 1);
          cy = p[1] - 2;
        } else {
          const p2 = polygons[cell][c];
          if (c > 1) {
            const dist = Math.hypot(p2[0] - polygons[cell][c - 1][0], p2[1] - polygons[cell][c - 1][1]);
            if (dist < 2)
              continue;
          }
          cx = (p[0] * 0.5 + p2[0] * 1.5) / 2;
          cy = (p[1] * 0.5 + p2[1] * 1.5) / 2 - 1;
        }
        const forest = "M" + cx + "," + cy + " q-1,0.8 -0.05,1.25 v0.75 h0.1 v-0.75 q0.95,-0.47 -0.05,-1.25 z ";
        const light = "M" + cx + "," + cy + " q-1,0.8 -0.05,1.25 h0.1 q0.95,-0.47 -0.05,-1.25 z ";
        const shade = "M" + cx + "," + cy + " q-1,0.8 -0.05,1.25 q-0.2,-0.55 0,-1.1 z ";
        g.append("path").attr("d", forest);
        g.append("path").attr("d", light).attr("fill", "white").attr("stroke", "none");
        g.append("path").attr("d", shade).attr("fill", "#999999").attr("stroke", "none");
      }
    }
  }
  console.timeEnd('drawRelief');
}

function addReliefIcon(height, type, cx, cy) {
  const g = terrain.select("#" + type).append("g");
  if (type === "mounts") {
    const h = height >= 0.7 ? (height - 0.55) * 12 : 1.8;
    const rnd = Math.random() * 0.8 + 0.2;
    let mount = "M" + cx + "," + cy + " L" + (cx + h / 3 + rnd) + "," + (cy - h / 4 - rnd * 1.2) + " L" + (cx + h / 1.1) + "," + (cy - h) + " L" + (cx + h + rnd) + "," + (cy - h / 1.2 + rnd) + " L" + (cx + h * 2) + "," + cy;
    let shade = "M" + cx + "," + cy + " L" + (cx + h / 3 + rnd) + "," + (cy - h / 4 - rnd * 1.2) + " L" + (cx + h / 1.1) + "," + (cy - h) + " L" + (cx + h / 1.5) + "," + cy;
    let dash = "M" + (cx - 0.1) + "," + (cy + 0.3) + " L" + (cx + 2 * h + 0.1) + "," + (cy + 0.3);
    dash += "M" + (cx + 0.4) + "," + (cy + 0.6) + " L" + (cx + 2 * h - 0.3) + "," + (cy + 0.6);
    g.append("path").attr("d", round(mount, 1)).attr("stroke", "#5c5c70");
    g.append("path").attr("d", round(shade, 1)).attr("fill", "#999999");
    g.append("path").attr("d", round(dash, 1)).attr("class", "strokes");
  }
  if (type === "hills") {
    let h = height > 0.5 ? (height - 0.4) * 10 : 1.2;
    if (h > 1.8)
      h = 1.8;
    let hill = "M" + cx + "," + cy + " Q" + (cx + h) + "," + (cy - h) + " " + (cx + 2 * h) + "," + cy;
    let shade = "M" + (cx + 0.6 * h) + "," + (cy + 0.1) + " Q" + (cx + h * 0.95) + "," + (cy - h * 0.91) + " " + (cx + 2 * h * 0.97) + "," + cy;
    let dash = "M" + (cx - 0.1) + "," + (cy + 0.2) + " L" + (cx + 2 * h + 0.1) + "," + (cy + 0.2);
    dash += "M" + (cx + 0.4) + "," + (cy + 0.4) + " L" + (cx + 2 * h - 0.3) + "," + (cy + 0.4);
    g.append("path").attr("d", round(hill, 1)).attr("stroke", "#5c5c70");
    g.append("path").attr("d", round(shade, 1)).attr("fill", "white");
    g.append("path").attr("d", round(dash, 1)).attr("class", "strokes");
  }
  if (type === "swamps") {
    const swamp = drawSwamp(cx, cy);
    g.append("path").attr("d", round(swamp, 1));
  }
  if (type === "forests") {
    const rnd = Math.random();
    const h = rnd * 0.4 + 0.6;
    const forest = "M" + cx + "," + cy + " q-1,0.8 -0.05,1.25 v0.75 h0.1 v-0.75 q0.95,-0.47 -0.05,-1.25 z ";
    const light = "M" + cx + "," + cy + " q-1,0.8 -0.05,1.25 h0.1 q0.95,-0.47 -0.05,-1.25 z ";
    const shade = "M" + cx + "," + cy + " q-1,0.8 -0.05,1.25 q-0.2,-0.55 0,-1.1 z ";
    g.append("path").attr("d", forest);
    g.append("path").attr("d", light).attr("fill", "white").attr("stroke", "none");
    g.append("path").attr("d", shade).attr("fill", "#999999").attr("stroke", "none");
  }
  g.on("click", editReliefIcon);
  return g;
}

function compareY(a, b) {
    if (a.data[1] > b.data[1]) return 1;
    if (a.data[1] < b.data[1]) return -1;
    return 0;
  }

  function drawSwamp(x, y) {
    let cx, cy;
    var h = 0.6, line = "";
    for (let c = 0; c < 3; c++) {
      if (c == 0) {
        cx = x;
        cy = y - 0.5 - Math.random();
      }
      if (c == 1) {
        cx = x + h + Math.random();
        cy = y + h + Math.random();
      }
      if (c == 2) {
        cx = x - h - Math.random();
        cy = y + 2 * h + Math.random();
      }
      line += "M" + cx + "," + cy + " H" + (cx - h / 6) + " M" + cx + "," + cy + " H" + (cx + h / 6) + " M" + cx + "," + cy + " L" + (cx - h / 3) + "," + (cy - h / 2) + " M" + cx + "," + cy + " V" + (cy - h / 1.5) + " M" + cx + "," + cy + " L" + (cx + h / 3) + "," + (cy - h / 2);
      line += "M" + (cx - h) + "," + cy + " H" + (cx - h / 2) + " M" + (cx + h / 2) + "," + cy + " H" + (cx + h);
    }
    return line;
  }

export {drawRelief}; 