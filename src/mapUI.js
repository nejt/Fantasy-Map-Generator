import {toHEX,rand,rn,round,si,getInteger,normalize} from "./basicFn.js" 
import {drawCoastline} from "./coast.js" 
import {drawRegions} from "./drawRegions.js" 
import {drawRelief} from "./drawRelief.js"

// Declare variables
  var svg = d3.select("svg"),
    defs = svg.select("#deftemp"),
    viewbox = svg.append("g").attr("id", "viewbox"),
    ocean = viewbox.append("g").attr("id", "ocean"),
    lakes = viewbox.append("g").attr("id", "lakes"),
    oceanLayers = ocean.append("g").attr("id", "oceanLayers"),
    oceanPattern = ocean.append("g").attr("id", "oceanPattern"),
    landmass = viewbox.append("g").attr("id", "landmass"),
    terrs = viewbox.append("g").attr("id", "terrs"),
    grid = viewbox.append("g").attr("id", "grid"),
    overlay = viewbox.append("g").attr("id", "overlay"),
    routes = viewbox.append("g").attr("id", "routes"),
    roads = routes.append("g").attr("id", "roads").attr("data-type", "land"),
    trails = routes.append("g").attr("id", "trails").attr("data-type", "land"),
    rivers = viewbox.append("g").attr("id", "rivers"),
    terrain = viewbox.append("g").attr("id", "terrain"),
    cults = viewbox.append("g").attr("id", "cults"),
    regions = viewbox.append("g").attr("id", "regions"),
    borders = viewbox.append("g").attr("id", "borders"),
    stateBorders = borders.append("g").attr("id", "stateBorders"),
    neutralBorders = borders.append("g").attr("id", "neutralBorders"),
    coastline = viewbox.append("g").attr("id", "coastline"),
    searoutes = routes.append("g").attr("id", "searoutes").attr("data-type", "sea"),
    labels = viewbox.append("g").attr("id", "labels"),
    burgLabels = labels.append("g").attr("id", "burgLabels"),
    icons = viewbox.append("g").attr("id", "icons"),
    burgIcons = icons.append("g").attr("id", "burgIcons"),
    ruler = viewbox.append("g").attr("id", "ruler"),
    debug = viewbox.append("g").attr("id", "debug");

  labels.append("g").attr("id", "countries");
  burgIcons.append("g").attr("id", "capitals");
  burgLabels.append("g").attr("id", "capitals");
  burgIcons.append("g").attr("id", "towns");
  burgLabels.append("g").attr("id", "towns");
  icons.append("g").attr("id", "capital-anchors");
  icons.append("g").attr("id", "town-anchors");
  terrain.append("g").attr("id", "hills");
  terrain.append("g").attr("id", "mounts");
  terrain.append("g").attr("id", "swamps");
  terrain.append("g").attr("id", "forests");

  // append ocean pattern
  oceanPattern.append("rect").attr("fill", "url(#oceanic)").attr("stroke", "none");
  oceanLayers.append("rect").attr("id", "oceanBase");

  // main data variables
  let distanceScale = 3, barSize = 2, distanceUnit = "mi"
  //size has to be the same for the same map every time with the same seed
  let graphWidth = 1200  //window.innerWidth; // voronoi graph extention, should be stable for each map
  let graphHeight = 1000 // window.innerHeight;
  let svgWidth = window.innerWidth, svgHeight = window.innerHeight;  // svg canvas resolution, can vary for each map
  
  // D3 Line generator variables
  var lineGen = d3.line().x(function(d) {return d.scX;}).y(function(d) {return d.scY;}).curve(d3.curveCatmullRom);

  // ZOOM *************************************************
  // D3 drag and zoom behavior
  var scale = 1, viewX = 0, viewY = 0;
  var zoom = d3.zoom().scaleExtent([1, 20]).on("zoom", zoomed);
  svg.call(zoom);

  function zoomed() {
    var scaleDiff = Math.abs(scale - d3.event.transform.k);
    scale = d3.event.transform.k;
    viewX = d3.event.transform.x;
    viewY = d3.event.transform.y;
    viewbox.attr("transform", d3.event.transform);
    // rescale only if zoom is significally changed
    if (scaleDiff > 0.001) {
      invokeActiveZooming();
      drawScaleBar();
    }
  }

  // Zoom to specific point (x,y - coods, z - scale, d - duration)
  function zoomTo(x, y, z, d) {
    const transform = d3.zoomIdentity.translate(x * -z + graphWidth / 2, y * -z + graphHeight / 2).scale(z);
    svg.transition().duration(d).call(zoom.transform, transform);
  }

  // Reset zoom to initial
  function resetZoom(duration) {
    zoom.transform(svg, d3.zoomIdentity);
  }

  // update Label Groups displayed on Style tab
  function updateLabelGroups() {
    if (styleElementSelect.value !== "labels") return;
    const cont = d3.select("#styleLabelGroupItems");
    cont.selectAll("button").remove();
    labels.selectAll("g").each(function() {
      const el = d3.select(this);
      const id = el.attr("id");
      const name = id.charAt(0).toUpperCase() + id.substr(1);
      const state = el.classed("hidden");
      if (id === "burgLabels") return;
      cont.append("button").attr("id", id).text(name).classed("buttonoff", state).on("click", function() {
        // toggle label group on click
        if (hideLabels.checked) hideLabels.click();
        const el = d3.select("#"+this.id);
        const state = !el.classed("hidden");
        el.classed("hidden", state);
        d3.select(this).classed("buttonoff", state);
      });
    });
  }

  // Active zooming
  function invokeActiveZooming() {
    // toggle shade/blur filter on zoom
    let filter = scale > 2.6 ? "url(#blurFilter)" : "url(#dropShadow)";
    if (scale > 1.5 && scale <= 2.6) filter = null;
    coastline.attr("filter", filter);
    // rescale lables on zoom (active zooming)
    labels.selectAll("g").each(function(d) {
      const el = d3.select(this);
      if (el.attr("id") === "burgLabels") return;
      const desired = +el.attr("data-size");
      let relative = rn((desired + (desired / scale)) / 2, 2);
      if (relative < 2) {relative = 2;}
      el.attr("font-size", relative);
      /*
      if (hideLabels.checked) {
        el.classed("hidden", relative * scale < 6);
        updateLabelGroups();
      }
      */
    });

    if (ruler.size()) {
      if (ruler.style("display") !== "none") {
        if (ruler.selectAll("g").size() < 1) {return;}
        const factor = rn(1 / Math.pow(scale, 0.3), 1);
        ruler.selectAll("circle:not(.center)").attr("r", 2 * factor).attr("stroke-width", 0.5 * factor);
        ruler.selectAll("circle.center").attr("r", 1.2 * factor).attr("stroke-width", 0.3 * factor);
        ruler.selectAll("text").attr("font-size", 10 * factor);
        ruler.selectAll("line, path").attr("stroke-width", factor);
      }
    }
  }
  //END ZOOM *******************************************************

  //DRAG *******************************************************
  // Drag actions
  var drag = d3.drag()
    .container(function() {return this;})
    .subject(function() {var p=[d3.event.x, d3.event.y]; return [p, p];})
    .on("start", dragstarted);

  function dragstarted() {
    var x0 = d3.event.x, y0 = d3.event.y,
        c0 = diagram.find(x0, y0).index, c1 = c0;
    var x1, y1;
    var opisometer = $("#addOpisometer").hasClass("pressed");
    var planimeter = $("#addPlanimeter").hasClass("pressed");
    var factor = rn(1 / Math.pow(scale, 0.3), 1);

    if (opisometer || planimeter) {
      $("#ruler").show();
      var type = opisometer ? "opisometer" : "planimeter";
      var rulerNew = ruler.append("g").attr("class", type).call(d3.drag().on("start", elementDrag));
      var points = [{scX: rn(x0, 2), scY: rn(y0, 2)}];
      if (opisometer) {
        var curve = rulerNew.append("path").attr("class", "opisometer white").attr("stroke-width", factor);
        var dash = rn(30 / distanceScale, 2);
        var curveGray = rulerNew.append("path").attr("class", "opisometer gray").attr("stroke-dasharray", dash).attr("stroke-width", factor);
      } else {
        var curve = rulerNew.append("path").attr("class", "planimeter").attr("stroke-width", factor);
      }
      var text = rulerNew.append("text").attr("dy", -1).attr("font-size", 10 * factor);
    }

    d3.event.on("drag", function() {
      x1 = d3.event.x, y1 = d3.event.y;
      var c2 = diagram.find(x1, y1).index;

      if (opisometer || planimeter) {
        var l = points[points.length - 1];
        var diff = Math.hypot(l.scX - x1, l.scY - y1);
        if (diff > 5) {points.push({scX: x1, scY: y1});}
        if (opisometer) {
          lineGen.curve(d3.curveBasis);
          var d = round(lineGen(points));
          curve.attr("d", d);
          curveGray.attr("d", d);
          var dist = rn(curve.node().getTotalLength());
          var label = rn(dist * distanceScale) + " " + distanceUnit;
          text.attr("x", x1).attr("y", y1 - 10).text(label);
        } else {
          lineGen.curve(d3.curveBasisClosed);
          var d = round(lineGen(points));
          curve.attr("d", d);
        }
      }
    });

    d3.event.on("end", function() {
      if (customization === 1) updateHistory();
      if (opisometer || planimeter) {
        $("#addOpisometer, #addPlanimeter").removeClass("pressed");
        restoreDefaultEvents();
        if (opisometer) {
          var dist = rn(curve.node().getTotalLength());
          var c = curve.node().getPointAtLength(dist / 2);
          var p = curve.node().getPointAtLength((dist / 2) - 1);
          var label = rn(dist * distanceScale) + " " + distanceUnit;
          var atan = p.x > c.x ? Math.atan2(p.y - c.y, p.x - c.x) : Math.atan2(c.y - p.y, c.x - p.x);
          var angle = rn(atan * 180 / Math.PI, 3);
          var tr = "rotate(" + angle + " " + c.x + " " + c.y +")";
          text.attr("data-points", JSON.stringify(points)).attr("data-dist", dist).attr("x", c.x).attr("y", c.y).attr("transform", tr).text(label).on("click", removeParent);
          rulerNew.append("circle").attr("cx", points[0].scX).attr("cy", points[0].scY).attr("r", 2 * factor).attr("stroke-width", 0.5 * factor)
            .attr("data-edge", "start").call(d3.drag().on("start", opisometerEdgeDrag));
          rulerNew.append("circle").attr("cx", points[points.length - 1].scX).attr("cy", points[points.length - 1].scY).attr("r", 2 * factor).attr("stroke-width", 0.5 * factor)
            .attr("data-edge", "end").call(d3.drag().on("start", opisometerEdgeDrag));
        } else {
          var vertices = points.map(function(p) {return [p.scX, p.scY]});
          var area = rn(Math.abs(d3.polygonArea(vertices))); // initial area as positive integer
          var areaConv = area * Math.pow(distanceScale, 2); // convert area to distanceScale
          areaConv = si(areaConv);
          if (areaUnit.value === "square") {areaConv += " " + distanceUnit + "²"} else {areaConv += " " + areaUnit.value;}
          var c = polylabel([vertices], 1.0); // pole of inaccessibility
          text.attr("x", rn(c[0], 2)).attr("y", rn(c[1], 2)).attr("data-area", area).text(areaConv).on("click", removeParent);
        }
      }
    });
  }

  // drag any element changing transform
  function elementDrag() {
    const el = d3.select(this);
    const tr = parseTransform(el.attr("transform"));
    const dx = +tr[0] - d3.event.x, dy = +tr[1] - d3.event.y;

    d3.event.on("drag", function() {
      const x = d3.event.x, y = d3.event.y;
      const transform = `translate(${(dx+x)},${(dy+y)}) rotate(${tr[2]} ${tr[3]} ${tr[4]})`;
      el.attr("transform", transform);
      const pp = this.parentNode.parentNode.id;
      if (pp === "burgIcons" || pp === "burgLabels") {
        tip('Use dragging for fine-tuning only, to move burg to a different cell use "Relocate" button');
      }
      if (pp === "labels") {
        // also transform curve control circle
        debug.select("circle").attr("transform", transform);
      }
    });

    d3.event.on("end", function() {
      // remember scaleBar bottom-right position
      if (el.attr("id") === "scaleBar") {
        const xEnd = d3.event.x, yEnd = d3.event.y;
        const diff = Math.abs(x - xEnd) + Math.abs(y - yEnd);
        if (diff > 5) {
          const bbox = el.node().getBoundingClientRect();
          sessionStorage.setItem("scaleBar", [bbox.right, bbox.bottom]);
        }
      }
    });
  }

  function opisometerEdgeDrag() {
    var el = d3.select(this);
    var x0 = +el.attr("cx"), y0 = +el.attr("cy");
    var group = d3.select(this.parentNode);
    var curve = group.select(".white");
    var curveGray = group.select(".gray");
    var text = group.select("text");
    var points = JSON.parse(text.attr("data-points"));
    if (x0 === points[0].scX && y0 === points[0].scY) {points.reverse();}

    d3.event.on("drag", function() {
      var x = d3.event.x, y = d3.event.y;
      el.attr("cx", x).attr("cy", y);
      var l = points[points.length - 1];
      var diff = Math.hypot(l.scX - x, l.scY - y);
      if (diff > 5) {points.push({scX: x, scY: y});} else {return;}
      lineGen.curve(d3.curveBasis);
      var d = round(lineGen(points));
      curve.attr("d", d);
      curveGray.attr("d", d);
      var dist = rn(curve.node().getTotalLength());
      var label = rn(dist * distanceScale) + " " + distanceUnit;
      text.attr("x", x).attr("y", y).text(label);
    });

    d3.event.on("end", function() {
      var dist = rn(curve.node().getTotalLength());
      var c = curve.node().getPointAtLength(dist / 2);
      var p = curve.node().getPointAtLength((dist / 2) - 1);
      var label = rn(dist * distanceScale) + " " + distanceUnit;
      var atan = p.x > c.x ? Math.atan2(p.y - c.y, p.x - c.x) : Math.atan2(c.y - p.y, c.x - p.x);
      var angle = rn(atan * 180 / Math.PI, 3);
      var tr = "rotate(" + angle + " " + c.x + " " + c.y +")";
      text.attr("data-points", JSON.stringify(points)).attr("data-dist", dist).attr("x", c.x).attr("y", c.y).attr("transform", tr).text(label);
    });
  }
  //END DRAG *******************************************************

  // toggle off loading screen and on menus
  $("#mapLayers").sortable({items: "li:not(.solid)", cancel: ".solid", update: moveLayer});
  $("#templateBody").sortable({items: "div:not(div[data-type='Mountain'])"});
  $("#mapLayers, #templateBody").disableSelection();

  // move layers on mapLayers dragging (jquery sortable)
  function moveLayer(event, ui) {
    var el = getLayer(ui.item.attr("id"));
    if (el) {
      var prev = getLayer(ui.item.prev().attr("id"));
      var next = getLayer(ui.item.next().attr("id"));
      if (prev) {el.insertAfter(prev);} else if (next) {el.insertBefore(next);}
    }
  }

  // clear elSelected variable
  function unselect() {
    if (!elSelected) return;
    elSelected.call(d3.drag().on("drag", null)).attr("class", null);
    debug.selectAll("*").remove();
    viewbox.style("cursor", "default");
    elSelected = null;
  }

  // restore default drag (map panning) and cursor
  function restoreDefaultEvents() {
    viewbox.style("cursor", "default").on(".drag", null).on("click", null);
  }  

  // transform string to array [translateX,translateY,rotateDeg,rotateX,rotateY,scale]
  function parseTransform(string) {
    if (!string) {return [0,0,0,0,0,1];}
    var a = string.replace(/[a-z()]/g,"").replace(/[ ]/g,",").split(",");
    return [a[0] || 0, a[1] || 0, a[2] || 0, a[3] || 0, a[4] || 0, a[5] || 1];
  }

  //SCALE BAR *******************************************************
  // fit ScaleBar to map size
  function fitScaleBar() {
    const el = d3.select("#scaleBar");
    if (!el.select("rect").size()) return;
    const bbox = el.select("rect").node().getBBox();
    let tr = [svgWidth - bbox.width, svgHeight - (bbox.height - 10)];
    if (sessionStorage.getItem("scaleBar")) {
      const scalePos = sessionStorage.getItem("scaleBar").split(",");
      tr = [+scalePos[0] - bbox.width, +scalePos[1] - bbox.height];
    }
    el.attr("transform", "translate(" + rn(tr[0]) + "," + rn(tr[1]) + ")");
  }

  // draw default scale bar
  function drawScaleBar() {
    let barLabel = ""

    if ($("#scaleBar").hasClass("hidden")) return; // no need to re-draw hidden element
    svg.select("#scaleBar").remove(); // fully redraw every time
    // get size
    var size = barSize
    var dScale = distanceScale
    var unit = distanceUnit
    var scaleBar = svg.append("g").attr("id", "scaleBar").call(d3.drag().on("start", elementDrag));
    const init = 100; // actual length in pixels if scale, dScale and size = 1;
    let val = init * size * dScale / scale; // bar length in distance unit
    if (val > 900) {val = rn(val, -3);} // round to 1000
    else if (val > 90) {val = rn(val, -2);} // round to 100
    else if (val > 9) {val = rn(val, -1);} // round to 10
    else {val = rn(val)} // round to 1
    const l = val * scale / dScale; // actual length in pixels on this scale
    const x = 0, y = 0; // initial position
    scaleBar.append("line").attr("x1", x+0.5).attr("y1", y).attr("x2", x+l+size-0.5).attr("y2", y).attr("stroke-width", size).attr("stroke", "white");
    scaleBar.append("line").attr("x1", x).attr("y1", y + size).attr("x2", x+l+size).attr("y2", y + size).attr("stroke-width", size).attr("stroke", "#3d3d3d");
    const dash = size + " " + rn(l / 5 - size, 2);
    scaleBar.append("line").attr("x1", x).attr("y1", y).attr("x2", x+l+size).attr("y2", y)
      .attr("stroke-width", rn(size * 3, 2)).attr("stroke-dasharray", dash).attr("stroke", "#3d3d3d");
    // big scale
    for (let b = 0; b < 6; b++) {
      var value = rn(b * l / 5, 2);
      var label = rn(value * dScale / scale);
      if (b === 5) {
        scaleBar.append("text").attr("x", x + value).attr("y", y - 2 * size).attr("font-size", rn(5 * size, 1)).text(label + " " + unit);
      } else {
        scaleBar.append("text").attr("x", x + value).attr("y", y - 2 * size).attr("font-size", rn(5 * size, 1)).text(label);
      }
    }
    if (barLabel !== "") {
      scaleBar.append("text").attr("x", x + (l+1) / 2).attr("y", y + 2 * size)
        .attr("dominant-baseline", "text-before-edge")
        .attr("font-size", rn(5 * size, 1)).text(barLabel.value);
    }
    const bbox = scaleBar.node().getBBox();
    // append backbround rectangle
    scaleBar.insert("rect", ":first-child").attr("x", -10).attr("y", -20).attr("width", bbox.width + 10).attr("height", bbox.height + 15)
      .attr("stroke-width", size).attr("stroke", "none").attr("filter", "url(#blur5)")
      .attr("fill", "#ffffff").attr("opacity", 0.2);
    fitScaleBar();
  }

  // draw default ruler measiring land x-axis edges
  function drawDefaultRuler(minXedge, maxXedge) {
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
    const label = rn(dist * distanceScale) + " " + distanceUnit;
    rulerNew.append("text").attr("x", x0).attr("y", y0).attr("dy", -1).attr("transform", tr).attr("data-dist", dist).text(label).on("click", removeParent).attr("font-size", 10);
  }

  // draw ruler circles and update label
  function rulerEdgeDrag() {
    var group = d3.select(this.parentNode);
    var edge = d3.select(this).attr("data-edge");
    var x = d3.event.x, y = d3.event.y, x0, y0;
    d3.select(this).attr("cx", x).attr("cy", y);
    var line = group.selectAll("line");
    if (edge === "left") {
      line.attr("x1", x).attr("y1", y);
      x0 = +line.attr("x2"), y0 = +line.attr("y2");
    } else {
      line.attr("x2", x).attr("y2", y);
      x0 = +line.attr("x1"), y0 = +line.attr("y1");
    }
    var xc = rn((x + x0) / 2, 2), yc = rn((y + y0) / 2, 2);
    group.select(".center").attr("cx", xc).attr("cy", yc);
    var dist = rn(Math.hypot(x0 - x, y0 - y));
    var label = rn(dist * distanceScale) + " " + distanceUnit;
    var atan = x0 > x ? Math.atan2(y0 - y, x0 - x) : Math.atan2(y - y0, x - x0);
    var angle = rn(atan * 180 / Math.PI, 3);
    var tr = "rotate(" + angle + " " + xc + " " + yc +")";
    group.select("text").attr("x", xc).attr("y", yc).attr("transform", tr).attr("data-dist", dist).text(label);
  }

  // draw ruler center point to split ruler into 2 parts
  function rulerCenterDrag() {
    var xc1, yc1, xc2, yc2;
    var group = d3.select(this.parentNode); // current ruler group
    var x = d3.event.x, y = d3.event.y; // current coords
    var line = group.selectAll("line"); // current lines
    var x1 = +line.attr("x1"), y1 = +line.attr("y1"), x2 = +line.attr("x2"), y2 = +line.attr("y2"); // initial line edge points
    var rulerNew = ruler.insert("g", ":first-child");
    rulerNew.call(d3.drag().on("start", elementDrag));
    var factor = rn(1 / Math.pow(scale, 0.3), 1);
    rulerNew.append("line").attr("class", "white").attr("stroke-width", factor);
    var dash = +group.select(".gray").attr("stroke-dasharray");
    rulerNew.append("line").attr("class", "gray").attr("stroke-dasharray", dash).attr("stroke-width", factor);
    rulerNew.append("text").attr("dy", -1).on("click", removeParent).attr("font-size", 10 * factor).attr("stroke-width", factor);

    d3.event.on("drag", function() {
      x = d3.event.x, y = d3.event.y;
      d3.select(this).attr("cx", x).attr("cy", y);
      // change first part
      line.attr("x1", x1).attr("y1", y1).attr("x2", x).attr("y2", y);
      var dist = rn(Math.hypot(x1 - x, y1 - y));
      var label = rn(dist * distanceScale) + " " + distanceUnit;
      var atan = x1 > x ? Math.atan2(y1 - y, x1 - x) : Math.atan2(y - y1, x - x1);
      xc1 = rn((x + x1) / 2, 2), yc1 = rn((y + y1) / 2, 2);
      var tr = "rotate(" + rn(atan * 180 / Math.PI, 3) + " " + xc1 + " " + yc1 +")";
      group.select("text").attr("x", xc1).attr("y", yc1).attr("transform", tr).attr("data-dist", dist).text(label);
      // change second (new) part
      dist = rn(Math.hypot(x2 - x, y2 - y));
      label = rn(dist * distanceScale) + " " + distanceUnit;
      atan = x2 > x ? Math.atan2(y2 - y, x2 - x) : Math.atan2(y - y2, x - x2);
      xc2 = rn((x + x2) / 2, 2), yc2 = rn((y + y2) / 2, 2);
      tr = "rotate(" + rn(atan * 180 / Math.PI, 3) + " " + xc2 + " " + yc2 +")";
      rulerNew.selectAll("line").attr("x1", x).attr("y1", y).attr("x2", x2).attr("y2", y2);
      rulerNew.select("text").attr("x", xc2).attr("y", yc2).attr("transform", tr).attr("data-dist", dist).text(label);
    });

    d3.event.on("end", function() {
      // circles for 1st part
      group.selectAll("circle").remove();
      group.append("circle").attr("cx", x1).attr("cy", y1).attr("r", 2 * factor).attr("stroke-width", 0.5 * factor).attr("data-edge", "left").call(d3.drag().on("drag", rulerEdgeDrag));
      group.append("circle").attr("cx", x).attr("cy", y).attr("r", 2 * factor).attr("stroke-width", 0.5 * factor).attr("data-edge", "rigth").call(d3.drag().on("drag", rulerEdgeDrag));
      group.append("circle").attr("cx", xc1).attr("cy", yc1).attr("r", 1.2 * factor).attr("stroke-width", 0.3 * factor).attr("class", "center").call(d3.drag().on("start", rulerCenterDrag));
      // circles for 2nd part
      rulerNew.append("circle").attr("cx", x).attr("cy", y).attr("r", 2 * factor).attr("stroke-width", 0.5 * factor).attr("data-edge", "left").call(d3.drag().on("drag", rulerEdgeDrag));
      rulerNew.append("circle").attr("cx", x2).attr("cy", y2).attr("r", 2 * factor).attr("stroke-width", 0.5 * factor).attr("data-edge", "rigth").call(d3.drag().on("drag", rulerEdgeDrag));
      rulerNew.append("circle").attr("cx", xc2).attr("cy", yc2).attr("r", 1.2 * factor).attr("stroke-width", 0.3 * factor).attr("class", "center").call(d3.drag().on("start", rulerCenterDrag));
    });
  }
  //END SCALE BAR *******************************************************

  // remove parent element (usually if child is clicked)
  function removeParent() {
    $(this.parentNode).remove();
  }

  // Append burg elements
  function drawManors(manors,states) {
    console.time('drawManors');
    const capitalIcons = burgIcons.select("#capitals");
    const capitalLabels = burgLabels.select("#capitals");
    const townIcons = burgIcons.select("#towns");
    const townLabels = burgLabels.select("#towns");
    const capitalSize = capitalIcons.attr("size") || 2;
    const townSize = townIcons.attr("size") || 1;
    capitalIcons.selectAll("*").remove();
    capitalLabels.selectAll("*").remove();
    townIcons.selectAll("*").remove();
    townLabels.selectAll("*").remove();

    for (let i = 0; i < manors.length; i++) {
      const x = manors[i].x, y = manors[i].y;
      const cell = manors[i].cell;
      const name = manors[i].name;
      const ic = i < states.length ? capitalIcons : townIcons;
      const lb = i < states.length ? capitalLabels : townLabels;
      const size = i < states.length ? capitalSize : townSize;
      ic.append("circle").attr("data-id", i).attr("cx", x).attr("cy", y).attr("r", size);
      lb.append("text").attr("data-id", i).attr("x", x).attr("y", y).attr("dy", "-0.35em").text(name);
    }
    console.timeEnd('drawManors');
  }

  // restore initial style
  function applyDefaultStyle(map) {
    //viewbox.on("touchmove mousemove", moved);
    landmass.attr("opacity", 1).attr("fill", "#eef6fb");
    coastline.attr("opacity", .5).attr("stroke", "#1f3846").attr("stroke-width", .7).attr("filter", "url(#dropShadow)");
    regions.attr("opacity", .4);
    stateBorders.attr("opacity", .8).attr("stroke", "#56566d").attr("stroke-width", .7).attr("stroke-dasharray", "1.2 1.5").attr("stroke-linecap", "butt");
    neutralBorders.attr("opacity", .8).attr("stroke", "#56566d").attr("stroke-width", .5).attr("stroke-dasharray", "1 1.5").attr("stroke-linecap", "butt");
    cults.attr("opacity", .6);
    rivers.attr("opacity", 1).attr("fill", "#5d97bb");
    lakes.attr("opacity", .5).attr("fill", "#a6c1fd").attr("stroke", "#5f799d").attr("stroke-width", .7);
    icons.selectAll("g").attr("opacity", 1).attr("fill", "#ffffff").attr("stroke", "#3e3e4b");
    roads.attr("opacity", .9).attr("stroke", "#d06324").attr("stroke-width", .35).attr("stroke-dasharray", "1.5").attr("stroke-linecap", "butt");
    trails.attr("opacity", .9).attr("stroke", "#d06324").attr("stroke-width", .15).attr("stroke-dasharray", ".8 1.6").attr("stroke-linecap", "butt");
    searoutes.attr("opacity", .8).attr("stroke", "#ffffff").attr("stroke-width", .35).attr("stroke-dasharray", "1 2").attr("stroke-linecap", "round");
    grid.attr("opacity", 1).attr("stroke", "#808080").attr("stroke-width", .1);
    ruler.attr("opacity", 1).style("display", "none").attr("filter", "url(#dropShadow)");
    overlay.attr("opacity", .8).attr("stroke", "#808080").attr("stroke-width", .5);

    // ocean style
    ocean.attr("opacity", 1);
    oceanLayers.select("rect").attr("fill", "#53679f");
    oceanLayers.attr("filter", "");
    oceanPattern.attr("opacity", 1);
    oceanLayers.selectAll("path").attr("display", null);
    //styleOceanPattern.checked = true;
    //styleOceanLayers.checked = true;

    labels.attr("opacity", 1).attr("stroke", "#3a3a3a").attr("stroke-width", 0);
    let size = rn(8 - map.regions / 20);
    if (size < 3) size = 3;
    burgLabels.select("#capitals").attr("fill", "#3e3e4b").attr("opacity", 1).attr("font-family", "Almendra SC").attr("data-font", "Almendra+SC").attr("font-size", size).attr("data-size", size);
    burgLabels.select("#towns").attr("fill", "#3e3e4b").attr("opacity", 1).attr("font-family", "Almendra SC").attr("data-font", "Almendra+SC").attr("font-size", 3).attr("data-size", 4);
    burgIcons.select("#capitals").attr("size", 1).attr("stroke-width", .24).attr("fill", "#ffffff").attr("stroke", "#3e3e4b").attr("fill-opacity", .7).attr("stroke-opacity", 1).attr("opacity", 1);
    burgIcons.select("#towns").attr("size", .5).attr("stroke-width", .12).attr("fill", "#ffffff").attr("stroke", "#3e3e4b").attr("fill-opacity", .7).attr("stroke-opacity", 1).attr("opacity", 1);
    size = rn(16 - map.regions / 6);
    if (size < 6) size = 6;
    labels.select("#countries").attr("fill", "#3e3e4b").attr("opacity", 1).attr("font-family", "Almendra SC").attr("data-font", "Almendra+SC").attr("font-size", size).attr("data-size", size);
    icons.select("#capital-anchors").attr("fill", "#ffffff").attr("stroke", "#3e3e4b").attr("stroke-width", 1.2).attr("size", 2);
    icons.select("#town-anchors").attr("fill", "#ffffff").attr("stroke", "#3e3e4b").attr("stroke-width", 1.2).attr("size", 1);
  }

  // close all dialogs except stated
  function closeDialogs(except) {
    except = except || "#except";
    $(".dialog:visible").not(except).each(function(e) {
      $(this).dialog("close");
    });
  }

let UI = new Vue({
  data: {},
  created: function () {
    
  },
  methods : {
    drawMap(map) {
      $("#loading, #initial").remove();
      // set extent to map borders + 100px to get infinity world reception
      drawScaleBar()
      //draw ocean
      map.ocean.path.forEach((p,i) => {
        oceanLayers.append("path").attr("d", p).attr("fill", "#ecf2f9").style("opacity", map.ocean.opacity[i])  
      })
      //regraph
      grid.append("path").attr("d", map.grid.path)
      //rivers
      map.rivers.forEach(r=> {
        rivers.append("path").attr("d", r.d).attr("id", "river"+r.i).attr("data-width", r.w).attr("data-increment", r.inc);  
      })
      //coast draw
      let mEdge = drawCoastline(lineGen, map._seed, map._width, map._height, map.cells, map.features, map.land, map.diagram, defs, lakes, landmass, coastline, ruler)
      // draw the landmass
      drawDefaultRuler(...mEdge);
      drawRelief(terrain, map.land, map.polygons, map.cells, map.options)
      //draw oceans
      map.achors.forEach(a=>{
        group.append("use").attr("xlink:href", "#icon-anchor").attr("data-id", a.id)
          .attr("x", a.x).attr("y", a.y).attr("width", a.size).attr("height", a.size)  
      })
      //cultures
      drawManors(map.manors,map.states)
      drawRegions(map.cells, map.polygons, map.states, map.diagram, map.manors, labels, regions, {state:stateBorders,neutral:neutralBorders})
      //handle routes
      map.routes.roads.forEach(r=> roads.append("path").attr("d", r.d).attr("id", "road" + r.id))
      map.routes.trails.forEach(r=> trails.append("path").attr("d", r.d).attr("id", "road" + r.id))
      map.routes.searoutes.forEach(r=> searoutes.append("path").attr("d", r.d).attr("id", "road" + r.id))
      //update svg
      closeDialogs();
      applyDefaultStyle(map); // apply style on load
      //focusOn(); // based on searchParams focus on point, cell or burg from MFCG
      invokeActiveZooming();
    }
  }
})

// change svg size on manual size change or window resize, do not change graph size
  function changeMapSize() {
    fitScaleBar();
    svgWidth = window.innerWidth;
    svgHeight = window.innerHeight;
    svg.attr("width", svgWidth).attr("height", svgHeight);
    const width = Math.max(svgWidth, graphWidth);
    const height = Math.max(svgHeight, graphHeight);
    zoom.translateExtent([[0, 0], [width, height]]);
    svg.select("#ocean").selectAll("rect").attr("x", 0)
      .attr("y", 0).attr("width", width).attr("height", height);
  }

  // fit full-screen map if window is resized
  $(window).resize(function(e) {
    // trick to prevent resize on download bar opening
    if (autoResize === false) return;
    changeMapSize();
  });


export {UI}; 

// Get cell info on mouse move (useful for debugging)
  /*
  function moved() {
    const point = d3.mouse(this);
    const i = diagram.find(point[0], point[1]).index;

    // update cellInfo
    if (i) {
      const p = cells[i]; // get cell
      infoX.innerHTML = rn(point[0]);
      infoY.innerHTML = rn(point[1]);
      infoCell.innerHTML = i;
      infoArea.innerHTML = ifDefined(p.area, "n/a", 2);
      if (customization === 1) {infoHeight.innerHTML = heights[i];}
      else {infoHeight.innerHTML = ifDefined(p.height, "n/a");}
      infoFlux.innerHTML = ifDefined(p.flux, "n/a", 2);
      let country = p.region === undefined ? "n/a" : p.region === "neutral" ? "neutral" : states[p.region].name + " (" + p.region + ")";
      infoCountry.innerHTML = country;
      let culture = ifDefined(p.culture) !== "no" ? cultures[p.culture].name + " (" + p.culture + ")" : "n/a";
      infoCulture.innerHTML = culture;
      infoPopulation.innerHTML = ifDefined(p.pop, "n/a", 2);
      infoBurg.innerHTML = ifDefined(p.manor) !== "no" ? manors[p.manor].name + " (" + p.manor + ")" : "no";
      const feature = features[p.fn];
      if (feature !== undefined) {
        const fType = feature.land ? "Island" : feature.border ? "Ocean" : "Lake";
        infoFeature.innerHTML = fType + " (" + p.fn + ")";
      } else {
        infoFeature.innerHTML = "n/a";
      }
    }

    // update tooltip
    if (toggleTooltips.checked) {
      tooltip.innerHTML = tooltip.getAttribute("data-main");
      const group = d3.event.path[d3.event.path.length - 7].id;
      const subgroup = d3.event.path[d3.event.path.length - 8].id;
      if (group === "rivers") tip("Click to open River Editor");
      if (group === "routes") tip("Click to open Route Editor");
      if (group === "terrain") tip("Click to open Relief Icon Editor");
      if (group === "labels") tip("Click to open Label Editor");
      if (group === "icons") tip("Click to open Icon Editor");
      if (subgroup === "burgIcons") tip("Click to open Burg Editor");
      if (subgroup === "burgLabels") tip("Click to open Burg Editor");
    }

    // draw line for ranges placing for heightmap Customization
    if (customization === 1) {
      const line = debug.selectAll(".line");
      if (debug.selectAll(".tag").size() === 1) {
        const x = +debug.select(".tag").attr("cx");
        const y = +debug.select(".tag").attr("cy");
        if (line.size()) {line.attr("x1", x).attr("y1", y).attr("x2", point[0]).attr("y2", point[1]);}
        else {debug.insert("line", ":first-child").attr("class", "line")
      .attr("x1", x).attr("y1", y).attr("x2", point[0]).attr("y2", point[1]);}
      } else {
         line.remove();
      }
    }

    // change radius circle for Customization
    if (customization > 0) {
      const brush = $("#brushesButtons > .pressed");
      const brushId = brush.attr("id");
      if (brushId === "brushRange" || brushId === "brushTrough") return;
      if (!brush.length && !$("div.selected").length) return;
      let radius = 0;
      if (customization === 1) {
        radius = brushRadius.value;
        if (brushId === "brushHill" || brushId === "brushPit") {
          radius = Math.pow(brushPower.value * 4, .5);
        }
      }
      else if (customization === 2) radius = countriesManuallyBrush.value;
      else if (customization === 4) radius = culturesManuallyBrush.value;

      const r = rn(6 / graphSize * radius, 1);
      let clr = "#373737";
      if (customization === 2) {
        const state = +$("div.selected").attr("id").slice(5);
        clr = states[state].color === "neutral" ? "white" : states[state].color;
      }
      if (customization === 4) {
        const culture = +$("div.selected").attr("id").slice(7);
        clr = cultures[culture].color;
      }
    }
  }
  */