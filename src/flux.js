function flux() {
    console.time('flux');
    riversData = [];
    let riverNext = 0;
    land.sort(function(a, b) {return b.height - a.height;});
    for (let i = 0; i < land.length; i++) {
      const id = land[i].index;
      const sx = land[i].data[0];
      const sy = land[i].data[1];
      let fn = land[i].fn;
      if (land[i].ctype === 99) {
        if (land[i].river !== undefined) {
          let x, y;
          const min = Math.min(sy, graphHeight - sy, sx, graphWidth - sx);
          if (min === sy) {x = sx; y = 0;}
          if (min === graphHeight - sy) {x = sx; y = graphHeight;}
          if (min === sx) {x = 0; y = sy;}
          if (min === graphWidth - sx) {x = graphWidth; y = sy;}
          riversData.push({river: land[i].river, cell: id, x, y});
        }
        continue;
      }
      if (features[fn].river !== undefined) {
        if (land[i].river !== features[fn].river) {
          land[i].river = undefined;
          land[i].flux = 0;
        }
      }
      let minHeight = 1000, min;
      land[i].neighbors.forEach(function(e) {
        if (cells[e].height < minHeight) {
          minHeight = cells[e].height;
          min = e;
        }
      });
      // Define river number
      if (min !== undefined && land[i].flux > 1) {
        if (land[i].river === undefined) {
          // State new River
          land[i].river = riverNext;
          riversData.push({river: riverNext, cell: id, x: sx, y: sy});
          riverNext += 1;
        }
        // Assing existing River to the downhill cell
        if (cells[min].river == undefined) {
          cells[min].river = land[i].river;
        } else {
          var riverTo = cells[min].river;
          var iRiver = riversData.filter(function(e) {return (e.river == land[i].river);});
          var minRiver = riversData.filter(function(e) {return (e.river == riverTo);});
          var iRiverL = iRiver.length;
          var minRiverL = minRiver.length;
          // re-assing river nunber if new part is greater
          if (iRiverL >= minRiverL) {
            cells[min].river = land[i].river;
            iRiverL += 1;
            minRiverL -= 1;
          }
          // mark confluences
          if (cells[min].height >= 20 && iRiverL > 1 && minRiverL > 1) {
            if (!cells[min].confluence) {
              cells[min].confluence = minRiverL-1;
            } else {
              cells[min].confluence += minRiverL-1;
            }
          }
        }
      }
      if (cells[min].flux) cells[min].flux += land[i].flux;
      if (land[i].river !== undefined) {
        const px = cells[min].data[0];
        const py = cells[min].data[1];
        if (cells[min].height < 20) {
          // pour water to the sea
          const x = (px + sx) / 2 + (px - sx) / 10;
          const y = (py + sy) / 2 + (py - sy) / 10;
          riversData.push({river: land[i].river, cell: id, x, y});
        } else {
          if (cells[min].lake === 1) {
            fn = cells[min].fn;
            if (features[fn].river === undefined) features[fn].river = land[i].river;
          }
          // add next River segment
          riversData.push({river: land[i].river, cell: min, x: px, y: py});
        }
      }
    }
    console.timeEnd('flux')
    drawRiverLines(riverNext);
  }

  function drawRiverLines(riverNext) {
    let R = result.rivers = []
    console.time('drawRiverLines');
    for (let i = 0; i < riverNext; i++) {
      var dataRiver = riversData.filter(function(e) {return e.river === i;});
      if (dataRiver.length > 1) {
        var riverAmended = amendRiver(dataRiver, 1);
        var width = rn(0.8 + Math.random() * 0.4, 1);
        var increment = rn(0.8 + Math.random() * 0.4, 1);
        var d = drawRiver(riverAmended, width, increment);
        //Drawing
        R.push({
          i : i,
          d: d,
          w : width,
          inc : increment
        })
      }
    }
    console.timeEnd('drawRiverLines');
  }

  // add more river points on 1/3 and 2/3 of length
  function amendRiver(dataRiver, rndFactor) {
    var riverAmended = [], side = 1;
    for (let r = 0; r < dataRiver.length; r++) {
      var dX = dataRiver[r].x;
      var dY = dataRiver[r].y;
      var cell = dataRiver[r].cell;
      var c = cells[cell].confluence || 0;
      riverAmended.push([dX, dY, c]);
      if (r+1 < dataRiver.length) {
        var eX = dataRiver[r+1].x;
        var eY = dataRiver[r+1].y;
        var angle = Math.atan2(eY - dY, eX - dX);
        var serpentine = 1 / (r+1);
        var meandr = serpentine + 0.3 + Math.random() * 0.3 * rndFactor;
        if (Math.random() > 0.5) {side *= -1};
        var dist = Math.hypot(eX - dX, eY - dY);
        // if dist is big or river is small add 2 extra points
        if (dist > 8 || (dist > 4 && dataRiver.length < 6)) {
          var stX = (dX * 2 + eX) / 3;
          var stY = (dY * 2 + eY) / 3;
          var enX = (dX + eX * 2) / 3;
          var enY = (dY + eY * 2) / 3;
          stX += -Math.sin(angle) * meandr * side;
          stY += Math.cos(angle) * meandr * side;
          if (Math.random() > 0.8) {side *= -1};
          enX += Math.sin(angle) * meandr * side;
          enY += -Math.cos(angle) * meandr * side;
          riverAmended.push([stX, stY], [enX, enY]);
        // if dist is medium or river is small add 1 extra point
        } else if (dist > 4 || dataRiver.length < 6) {
          var scX = (dX + eX) / 2;
          var scY = (dY + eY) / 2;
          scX += -Math.sin(angle) * meandr * side;
          scY += Math.cos(angle) * meandr * side;
          riverAmended.push([scX, scY]);
        }
      }
    }
    return riverAmended;
  }

  // draw river polygon using arrpoximation
  function drawRiver(points, width, increment) {
      lineGen.curve(d3.curveCatmullRom.alpha(0.1));
      var extraOffset = 0.03; // start offset to make river source visible
      width = width || 1; // river width modifier
      increment = increment || 1; // river bed widening modifier
      var riverLength = 0;
      points.map(function(p, i) {
        if (i === 0) {return 0;}
        riverLength += Math.hypot(p[0] - points[i-1][0], p[1] - points[i-1][1]);
      });
      var widening = rn((1000 + (riverLength * 30)) * increment);
      var riverPointsLeft = [], riverPointsRight = [];
      var last = points.length - 1;
      var factor = riverLength / points.length;

      // first point
      var x = points[0][0], y = points[0][1], c;
      var angle = Math.atan2(y - points[1][1], x - points[1][0]);
      var xLeft = x + -Math.sin(angle) * extraOffset, yLeft = y + Math.cos(angle) * extraOffset;
      riverPointsLeft.push({scX:xLeft, scY:yLeft});
      var xRight = x + Math.sin(angle) * extraOffset, yRight = y + -Math.cos(angle) * extraOffset;
      riverPointsRight.unshift({scX:xRight, scY:yRight});

      // middle points
      for (let p = 1; p < last; p ++) {
        x = points[p][0], y = points[p][1], c = points[p][2];
        if (c) {extraOffset += Math.atan(c * 10 / widening);} // confluence
        var xPrev = points[p-1][0], yPrev = points[p-1][1];
        var xNext = points[p+1][0], yNext = points[p+1][1];
        angle = Math.atan2(yPrev - yNext, xPrev - xNext);
        var offset = (Math.atan(Math.pow(p * factor, 2) / widening) / 2 * width) + extraOffset;
        xLeft = x + -Math.sin(angle) * offset, yLeft = y + Math.cos(angle) * offset;
        riverPointsLeft.push({scX:xLeft, scY:yLeft});
        xRight = x + Math.sin(angle) * offset, yRight = y + -Math.cos(angle) * offset;
        riverPointsRight.unshift({scX:xRight, scY:yRight});
      }

      // end point
      x = points[last][0], y = points[last][1], c = points[last][2];
      if (c) {extraOffset += Math.atan(c * 10 / widening);} // confluence
      angle = Math.atan2(points[last-1][1] - y, points[last-1][0] - x);
      xLeft = x + -Math.sin(angle) * offset, yLeft = y + Math.cos(angle) * offset;
      riverPointsLeft.push({scX:xLeft, scY:yLeft});
      xRight = x + Math.sin(angle) * offset, yRight = y + -Math.cos(angle) * offset;
      riverPointsRight.unshift({scX:xRight, scY:yRight});

      // generate path and return
      var right = lineGen(riverPointsRight);
      var left = lineGen(riverPointsLeft);
      left = left.substring(left.indexOf("C"));
      return round(right + left, 2);
  }

  // add lakes on depressed points on river course
function addLakes() {
  console.time('addLakes');
  let smallLakes = 0;
  for (let i = 0; i < land.length; i++) {
    // elavate all big lakes
    if (land[i].lake === 1) {
      land[i].height = 19;
      land[i].ctype = -1;
    }
    // define eligible small lakes
    if (land[i].lake === 2 && smallLakes < 100) {
      if (land[i].river !== undefined) {
        land[i].height = 19;
        land[i].ctype = -1;
        land[i].fn = -1;
        smallLakes++;
      } else {
        land[i].lake = undefined;
        land[i].neighbors.forEach(function(n) {
          if (cells[n].lake !== 1 && cells[n].river !== undefined) {
            cells[n].lake = 2;
            cells[n].height = 19;
            cells[n].ctype = -1;
            cells[n].fn = -1;
            smallLakes++;
          } else if (cells[n].lake === 2) {
            cells[n].lake = undefined;
          }
        });
      }
    }
  }
  console.log("small lakes: " + smallLakes);

  // mark small lakes
  let unmarked = land.filter(function(e) {
    return e.fn === -1
  });
  while (unmarked.length) {
    let fn = -1
      , queue = [unmarked[0].index]
      , lakeCells = [];
    unmarked[0].session = "addLakes";
    while (queue.length) {
      const q = queue.pop();
      lakeCells.push(q);
      if (cells[q].fn !== -1)
        fn = cells[q].fn;
      cells[q].neighbors.forEach(function(e) {
        if (cells[e].lake && cells[e].session !== "addLakes") {
          cells[e].session = "addLakes";
          queue.push(e);
        }
      });
    }
    if (fn === -1) {
      fn = features.length;
      features.push({
        i: fn,
        land: false,
        border: false
      });
    }
    lakeCells.forEach(function(c) {
      cells[c].fn = fn;
    });
    unmarked = land.filter(function(e) {
      return e.fn === -1
    });
  }

  land = cells.filter(function(e) {
    return e.height >= 20;
  });
  console.timeEnd('addLakes');
}

