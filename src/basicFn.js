// convert RGB color string to HEX without #
function toHEX(rgb) {
  if (rgb.charAt(0) === "#") {
    return rgb;
  }
  rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
  return (rgb && rgb.length === 4) ? "#" + ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) + ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) + ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
}

// random number in a range
function rand(min, max) {
  if (min === undefined && !max === undefined)
    return Math.random();
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
  return s.replace(/[\d\.-][\d\.e-]*/g, function(n) {
    return rn(n, d);
  })
}

// corvent number to short string with SI postfix
function si(n) {
  if (n >= 1e9) {
    return rn(n / 1e9, 1) + "B";
  }
  if (n >= 1e8) {
    return rn(n / 1e6) + "M";
  }
  if (n >= 1e6) {
    return rn(n / 1e6, 1) + "M";
  }
  if (n >= 1e4) {
    return rn(n / 1e3) + "K";
  }
  if (n >= 1e3) {
    return rn(n / 1e3, 1) + "K";
  }
  return rn(n);
}

// getInteger number from user input data
function getInteger(value) {
  var metric = value.slice(-1);
  if (metric === "K") {
    return parseInt(value.slice(0, -1) * 1e3);
  }
  if (metric === "M") {
    return parseInt(value.slice(0, -1) * 1e6);
  }
  if (metric === "B") {
    return parseInt(value.slice(0, -1) * 1e9);
  }
  return parseInt(value);
}

function normalize(val, min, max) {
    var normalized = (val - min) / (max - min);
    if (normalized < 0) {normalized = 0;}
    if (normalized > 1) {normalized = 1;}
    return normalized;
  }

export {toHEX,rand,rn,round,si,getInteger,normalize}; 