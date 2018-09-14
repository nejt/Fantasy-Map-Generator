// draw the Heightmap
function toggleHeight() {
  const scheme = styleSchemeInput.value;
  let hColor = color;
  if (scheme === "light")
    hColor = d3.scaleSequential(d3.interpolateRdYlGn);
  if (scheme === "green")
    hColor = d3.scaleSequential(d3.interpolateGreens);
  if (scheme === "monochrome")
    hColor = d3.scaleSequential(d3.interpolateGreys);
  if (!terrs.selectAll("path").size()) {
    cells.map(function(i, d) {
      let height = i.height;
      if (height < 20 && !i.lake)
        return;
      if (i.lake) {
        const nHeights = i.neighbors.map(function(e) {
          if (cells[e].height >= 20)
            return cells[e].height;
        })
        const mean = d3.mean(nHeights);
        if (!mean)
          return;
        height = Math.trunc(mean);
        if (height < 20 || isNaN(height))
          height = 20;
      }
      const clr = hColor((100 - height) / 100);
      terrs.append("path").attr("d", "M" + polygons[d].join("L") + "Z").attr("fill", clr).attr("stroke", clr);
    });
  } else {
    terrs.selectAll("path").remove();
  }
}

// draw Cultures
function toggleCultures() {
  if (cults.selectAll("path").size() == 0) {
    land.map(function(i) {
      const color = cultures[i.culture].color;
      cults.append("path").attr("d", "M" + polygons[i.index].join("L") + "Z").attr("id", "cult" + i.index).attr("fill", color).attr("stroke", color);
    });
  } else {
    cults.selectAll("path").remove();
  }
}

// draw Overlay
function toggleOverlay() {
  if (overlay.selectAll("*").size() === 0) {
    var type = styleOverlayType.value;
    var size = +styleOverlaySize.value;
    if (type === "pointyHex" || type === "flatHex") {
      let points = getHexGridPoints(size, type);
      let hex = "m" + getHex(size, type).slice(0, 4).join("l");
      let d = points.map(function(p) {
        return "M" + p + hex;
      }).join("");
      overlay.append("path").attr("d", d);
    } else if (type === "square") {
      var x = d3.range(size, svgWidth, size);
      var y = d3.range(size, svgHeight, size);
      overlay.append("g").selectAll("line").data(x).enter().append("line").attr("x1", function(d) {
        return d;
      }).attr("x2", function(d) {
        return d;
      }).attr("y1", 0).attr("y2", svgHeight);
      overlay.append("g").selectAll("line").data(y).enter().append("line").attr("y1", function(d) {
        return d;
      }).attr("y2", function(d) {
        return d;
      }).attr("x1", 0).attr("x2", svgWidth);
    } else {
      var tr = `translate(80 80) scale(${size / 20})`;
      d3.select("#rose").attr("transform", tr);
      overlay.append("use").attr("xlink:href", "#rose");
    }
    overlay.call(d3.drag().on("start", elementDrag));
  } else {
    overlay.selectAll("*").remove();
  }
}

function getHex(radius, type) {
  let x0 = 0
    , y0 = 0;
  let s = type === "pointyHex" ? 0 : Math.PI / -6;
  let thirdPi = Math.PI / 3;
  let angles = [s, s + thirdPi, s + 2 * thirdPi, s + 3 * thirdPi, s + 4 * thirdPi, s + 5 * thirdPi];
  return angles.map(function(angle) {
    var x1 = Math.sin(angle) * radius
      , y1 = -Math.cos(angle) * radius
      , dx = x1 - x0
      , dy = y1 - y0;
    x0 = x1,
    y0 = y1;
    return [dx, dy];
  });
}

function getHexGridPoints(size, type) {
  let points = [];
  const rt3 = Math.sqrt(3);
  const off = type === "pointyHex" ? rt3 * size / 2 : size * 3 / 2;
  const ySpace = type === "pointyHex" ? size * 3 / 2 : rt3 * size / 2;
  const xSpace = type === "pointyHex" ? rt3 * size : size * 3;
  for (let y = 0, l = 0; y < graphHeight; y += ySpace,
  l++) {
    for (let x = l % 2 ? 0 : off; x < graphWidth; x += xSpace) {
      points.push([x, y]);
    }
  }
  return points;
}

// Draw the water flux system (for dubugging)
function toggleFlux() {
  var colorFlux = d3.scaleSequential(d3.interpolateBlues);
  if (terrs.selectAll("path").size() == 0) {
    land.map(function(i) {
      terrs.append("path").attr("d", "M" + polygons[i.index].join("L") + "Z").attr("fill", colorFlux(0.1 + i.flux)).attr("stroke", colorFlux(0.1 + i.flux));
    });
  } else {
    terrs.selectAll("path").remove();
  }
}

$("#layoutPreset").on("change", function() {
  var preset = this.value;
  $("#mapLayers li").not("#toggleOcean").addClass("buttonoff");
  $("#toggleOcean").removeClass("buttonoff");
  $("#oceanPattern").fadeIn();
  $("#rivers, #terrain, #borders, #regions, #icons, #labels, #routes, #grid").fadeOut();
  cults.selectAll("path").remove();
  terrs.selectAll("path").remove();
  if (preset === "layoutPolitical") {
    toggleRivers.click();
    toggleRelief.click();
    toggleBorders.click();
    toggleCountries.click();
    toggleIcons.click();
    toggleLabels.click();
    toggleRoutes.click();
  }
  if (preset === "layoutCultural") {
    toggleRivers.click();
    toggleRelief.click();
    toggleBorders.click();
    $("#toggleCultures").click();
    toggleIcons.click();
    toggleLabels.click();
  }
  if (preset === "layoutEconomical") {
    toggleRivers.click();
    toggleRelief.click();
    toggleBorders.click();
    toggleIcons.click();
    toggleLabels.click();
    toggleRoutes.click();
  }
  if (preset === "layoutHeightmap") {
    $("#toggleHeight").click();
    toggleRivers.click();
  }
});
