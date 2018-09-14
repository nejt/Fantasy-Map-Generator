// Fantasy Map Generator main script
// Adapted from
// Azgaar (maxganiev@yandex.com). Minsk, 2017-2018
// https://github.com/Azgaar/Fantasy-Map-Generator
// GNU General Public License v3.0

"use strict;"
// Version control
const version = "0.1";
document.title += " v. " + version;

import * as mapUI from "./src/mapUI.js"

class fantasyMap {
  constructor(seed, CB) {
    //store options
    this._options = { 
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
        input : 200,
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
        input : 10,
        output : null
      },
      heightmapTemplate : {
        locked : false,
        input : null,
      },
      outlineLayers : {
        input : "-6,-3,-1"
      },
      transparency : 0,
      pngResolution : 5
    }

    // main data variables
    this._seed = seed || Math.floor(Math.random() * 1e9) // set random generator seed
    console.log(" seed: " + this._seed)

    //size has to be the same for the same map every time with the same seed
    this._width = 1200  
    this._height = 1000

    //WEBWORKER - handles all generation 
    this._worker = null
    if (window.Worker) {
      this._worker = new Worker('./src/generate.js')
      //on message
      this._worker.onmessage = function(e) {
        console.log('Message received from worker')
        console.time("TOTAL DRAW");
        updateWithResult(e.data)
        console.timeEnd("TOTAL DRAW");
      }
    }

    let updateWithResult = (result) => {
      //merge
      Object.assign(this,result)
      //do callback
      if(CB && typeof CB === "function") CB(this)
    }   

    //post data to worker
    this._worker.postMessage({seed:this._seed,width:this._width,height:this._height})
  }
}

let map = new fantasyMap(null,mapUI.UI.drawMap) //168746789

/*
      //update voronoi
      // set extent to map borders + 100px to get infinity world reception
      voronoi = d3.voronoi().extent([[-1, -1], [graphWidth + 1, graphHeight + 1]])
      diagram = voronoi(result.points)

// turn D3 polygons array into cell array, define neighbors for each cell
    function detectNeighbors(withGrid) {
      console.time("detectNeighbors");
      let gridPath = ""; // store grid as huge single path string
      cells = [];
      polygons.map(function(i, d) {
        const neighbors = [];
        let type; // define cell type
        if (withGrid) {gridPath += "M" + i.join("L") + "Z";} // grid path
        diagram.cells[d].halfedges.forEach(function(e) {
          const edge = diagram.edges[e];
          if (edge.left && edge.right) {
            const ea = edge.left.index === d ? edge.right.index : edge.left.index;
            neighbors.push(ea);
          } else {
            type = "border"; // polygon is on border if it has edge without opposite side polygon
          }
        })
        cells.push({index: d, data: i.data, height: 0, type, neighbors});
      });
      if (withGrid) {grid.append("path").attr("d", round(gridPath, 1));}
      console.timeEnd("detectNeighbors");
    }

    // fetch default fonts if not done before
    function loadDefaultFonts() {
      if (!$('link[href="fonts.css"]').length) {
        $("head").append('<link rel="stylesheet" type="text/css" href="fonts.css">');
        const fontsToAdd = ["Amatic+SC:700", "IM+Fell+English", "Great+Vibes", "MedievalSharp", "Metamorphous",
                          "Nova+Script", "Uncial+Antiqua", "Underdog", "Caesar+Dressing", "Bitter", "Yellowtail", "Montez",
                          "Shadows+Into+Light", "Fredericka+the+Great", "Orbitron", "Dancing+Script:700",
                          "Architects+Daughter", "Kaushan+Script", "Gloria+Hallelujah", "Satisfy", "Comfortaa:700", "Cinzel"];
        fontsToAdd.forEach(function(f) {if (fonts.indexOf(f) === -1) fonts.push(f);});
        updateFontOptions();
      }
    }

    // Update font list for Label and Burg Editors
    function updateFontOptions() {
      labelFontSelect.innerHTML = "";
      for (let i=0; i < fonts.length; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        const font = fonts[i].split(':')[0].replace(/\+/g, " ");
        opt.style.fontFamily = opt.innerHTML = font;
        labelFontSelect.add(opt);
      }
      burgSelectDefaultFont.innerHTML  = labelFontSelect.innerHTML;
    }


      // Hotkeys, see github.com/Azgaar/Fantasy-Map-Generator/wiki/Hotkeys
    d3.select("body").on("keydown", function() {
      const active = document.activeElement.tagName;
      if (active === "INPUT" || active === "SELECT" || active === "TEXTAREA") return;
      const key = d3.event.keyCode;
      const ctrl = d3.event.ctrlKey;
      const p = d3.mouse(this);
      if (key === 32) console.table(cells[diagram.find(p[0], p[1]).index]); // Space to log focused cell data
      else if (key === 192) console.log(cells); // "`" to log cells data
      else if (key === 66) console.table(manors); // "B" to log burgs data
      else if (key === 67) console.table(states); // "C" to log countries data
      else if (key === 70) console.table(features); // "F" to log features data
      else if (key === 37) zoom.translateBy(svg, 10, 0); // Left to scroll map left
      else if (key === 39) zoom.translateBy(svg, -10, 0); // Right to scroll map right
      else if (key === 38) zoom.translateBy(svg, 0, 10); // Up to scroll map up
      else if (key === 40) zoom.translateBy(svg, 0, -10); // Up to scroll map up
      else if (key === 107) zoom.scaleBy(svg, 1.2); // Plus to zoom map up
      else if (key === 109) zoom.scaleBy(svg, 0.8); // Minus to zoom map out
      else if (key === 48 || key === 96) resetZoom(); // 0 to reset zoom
      else if (key === 49 || key === 97) zoom.scaleTo(svg, 1); // 1 to zoom to 1
      else if (key === 50 || key === 98) zoom.scaleTo(svg, 2); // 2 to zoom to 2
      else if (key === 51 || key === 99) zoom.scaleTo(svg, 3); // 3 to zoom to 3
      else if (key === 52 || key === 100) zoom.scaleTo(svg, 4); // 4 to zoom to 4
      else if (key === 53 || key === 101) zoom.scaleTo(svg, 5); // 5 to zoom to 5
      else if (key === 54 || key === 102) zoom.scaleTo(svg, 6); // 6 to zoom to 6
      else if (key === 55 || key === 103) zoom.scaleTo(svg, 7); // 7 to zoom to 7
      else if (key === 56 || key === 104) zoom.scaleTo(svg, 8); // 8 to zoom to 8
      else if (key === 57 || key === 105) zoom.scaleTo(svg, 9); // 9 to zoom to 9
      else if (key === 9) $("#updateFullscreen").click(); // Tab to fit map to fullscreen
    });

    // define connection between option layer buttons and actual svg groups
    function getLayer(id) {
      if (id === "toggleGrid") {return $("#grid");}
      if (id === "toggleOverlay") {return $("#overlay");}
      if (id === "toggleHeight") {return $("#terrs");}
      if (id === "toggleCultures") {return $("#cults");}
      if (id === "toggleRoutes") {return $("#routes");}
      if (id === "toggleRivers") {return $("#rivers");}
      if (id === "toggleCountries") {return $("#regions");}
      if (id === "toggleBorders") {return $("#borders");}
      if (id === "toggleRelief") {return $("#terrain");}
      if (id === "toggleLabels") {return $("#labels");}
      if (id === "toggleIcons") {return $("#icons");}
    }

    function drawPerspective() {
      console.time("drawPerspective");
      const width = 320, height = 180;
      const wRatio = graphWidth / width, hRatio = graphHeight / height;
      const lineCount = 320, lineGranularity = 90;
      const perspective = document.getElementById("perspective");
      const pContext = perspective.getContext("2d");
      const lines = [];
      let i = lineCount;
      while (i--) {
        const x = i / lineCount * width | 0;
        const canvasPoints = [];
        lines.push(canvasPoints);
        let j = Math.floor(lineGranularity);
        while (j--) {
          const y = j / lineGranularity * height | 0;
          let h = getHeightInPoint(x * wRatio, y * hRatio) - 20;
          if (h < 1) h = 0;
          canvasPoints.push([x, y, h]);
        }
      }
      pContext.clearRect(0, 0, perspective.width, perspective.height);
      for (let canvasPoints of lines) {
        for (let i = 0; i < canvasPoints.length - 1; i++) {
          const pt1 = canvasPoints[i];
          const pt2 = canvasPoints[i + 1];
          const avHeight = (pt1[2] + pt2[2]) / 200;
          pContext.beginPath();
          pContext.moveTo(...transformPt(pt1));
          pContext.lineTo(...transformPt(pt2));
          let clr = "rgb(81, 103, 169)"; // water
          if (avHeight !== 0) {clr = color(1 - avHeight - 0.2);}
          pContext.strokeStyle = clr;
          pContext.stroke();
        }
        for (let i = 0; i < canvasPoints.length - 1; i++) {

        }
      }
      console.timeEnd("drawPerspective");
    }

    // get Height value in point for Perspective view
    function getHeightInPoint(x, y) {
      const index = diagram.find(x, y).index;
      return cells[index].height;
    }

    function transformPt(pt) {
      const width = 320, maxHeight = 0.2;
      var [x, y] = projectIsometric(pt[0], pt[1]);
      return [x + width / 2 + 10, y + 10 - pt[2] * maxHeight];
    }

    function projectIsometric(x, y) {
      const scale = 1, yProj = 4;
      return [(x - y) * scale, (x + y) / yProj * scale];
    }

    // Clear the map
    function undraw() {
      viewbox.selectAll("path, circle, line, text, use, #ruler > g").remove();
      defs.selectAll("*").remove();
      landmass.select("rect").remove();
      cells = [], land = [], riversData = [], manors = [], states = [], features = [], queue = [];
    }
  }
      */