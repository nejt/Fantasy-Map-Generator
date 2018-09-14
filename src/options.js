// Style options
  $("#styleElementSelect").on("change", function() {
    const sel = this.value;
    let el = viewbox.select("#"+sel);
    if (sel == "ocean") el = oceanLayers.select("rect");
    $("#styleInputs > div").hide();

    // opacity
    $("#styleOpacity, #styleFilter").css("display", "block");
    var opacity = el.attr("opacity") || 1;
    styleOpacityInput.value = styleOpacityOutput.value = opacity;

    // filter
    if (sel == "ocean") el = oceanLayers;
    styleFilterInput.value = el.attr("filter") || "";
    if (sel === "rivers" || sel === "lakes" || sel === "landmass") {
      $("#styleFill").css("display", "inline-block");
      styleFillInput.value = styleFillOutput.value = el.attr("fill");
    }

    if (sel === "roads" || sel === "trails" || sel === "searoutes" || sel === "lakes" || sel === "stateBorders" || sel === "neutralBorders" || sel === "grid" || sel === "overlay" || sel === "coastline") {
      $("#styleStroke").css("display", "inline-block");
      styleStrokeInput.value = styleStrokeOutput.value = el.attr("stroke");
      $("#styleStrokeWidth").css("display", "block");
      var width = el.attr("stroke-width") || "";
      styleStrokeWidthInput.value = styleStrokeWidthOutput.value = width;
    }

    if (sel === "roads" || sel === "trails" || sel === "searoutes" || sel === "stateBorders" || sel === "neutralBorders" || sel === "overlay") {
      $("#styleStrokeDasharray, #styleStrokeLinecap").css("display", "block");
      styleStrokeDasharrayInput.value = el.attr("stroke-dasharray") || "";
      styleStrokeLinecapInput.value = el.attr("stroke-linecap") || "inherit";
    }

    if (sel === "terrs") $("#styleScheme").css("display", "block");
    if (sel === "heightmap") $("#styleScheme").css("display", "block");
    if (sel === "overlay") $("#styleOverlay").css("display", "block");

    if (sel === "labels") {
      $("#styleFill, #styleStroke, #styleStrokeWidth, #styleFontSize").css("display", "inline-block");
      styleFillInput.value = styleFillOutput.value = el.select("g").attr("fill") || "#3e3e4b";
      styleStrokeInput.value = styleStrokeOutput.value = el.select("g").attr("stroke") || "#3a3a3a";
      styleStrokeWidthInput.value = styleStrokeWidthOutput.value = el.attr("stroke-width") || 0;
      $("#styleLabelGroups").css("display", "inline-block");
      updateLabelGroups();
    }

    if (sel === "ocean") {
      $("#styleOcean").css("display", "block");
      styleOceanBack.value = styleOceanBackOutput.value = svg.style("background-color");
      styleOceanFore.value = styleOceanForeOutput.value = oceanLayers.select("rect").attr("fill");
    }
  });

  $("#styleFillInput").on("input", function() {
    styleFillOutput.value = this.value;
    var el = svg.select("#"+styleElementSelect.value);
    if (styleElementSelect.value !== "labels") {
      el.attr('fill', this.value);
    } else {
      el.selectAll("g").attr('fill', this.value);
    }
  });

  $("#styleStrokeInput").on("input", function() {
    styleStrokeOutput.value = this.value;
    const el = svg.select("#"+styleElementSelect.value);
    el.attr('stroke', this.value);
  });

  $("#styleStrokeWidthInput").on("input", function() {
    styleStrokeWidthOutput.value = this.value;
    const el = svg.select("#"+styleElementSelect.value);
    el.attr('stroke-width', +this.value);
  });

  $("#styleStrokeDasharrayInput").on("input", function() {
    const sel = styleElementSelect.value;
    svg.select("#"+sel).attr('stroke-dasharray', this.value);
  });

  $("#styleStrokeLinecapInput").on("change", function() {
    const sel = styleElementSelect.value;
    svg.select("#"+sel).attr('stroke-linecap', this.value);
  });

  $("#styleOpacityInput").on("input", function() {
    styleOpacityOutput.value = this.value;
    const sel = styleElementSelect.value;
    svg.select("#"+sel).attr('opacity', this.value);

  });

  $("#styleFilterInput").on("change", function() {
    let sel = styleElementSelect.value;
    if (sel == "ocean") sel = "oceanLayers";
    const el = svg.select("#"+sel);
    el.attr('filter', this.value);
    zoom.scaleBy(svg, 1.00001); // enforce browser re-draw
  });

  $("#styleSchemeInput").on("change", function() {
    terrs.selectAll("path").remove();
    toggleHeight();
  });

  $("#styleOverlayType").on("change", function() {
    overlay.selectAll("*").remove();
    if (!$("#toggleOverlay").hasClass("buttonoff")) toggleOverlay();
  });

  $("#styleOverlaySize").on("change", function() {
    styleOverlaySizeOutput.value = this.value;
    overlay.selectAll("*").remove();
    if (!$("#toggleOverlay").hasClass("buttonoff")) toggleOverlay();
  });

  $("#styleOceanBack").on("input", function() {
    svg.style("background-color", this.value);
    styleOceanBackOutput.value = this.value;
  });

  $("#styleOceanFore").on("input", function() {
    oceanLayers.select("rect").attr("fill", this.value);
    styleOceanForeOutput.value = this.value;
  });

  $("#styleOceanPattern").on("click", function() {oceanPattern.attr("opacity", +this.checked);});

  $("#styleOceanLayers").on("click", function() {
    const display = this.checked ? "block" : "none";
    oceanLayers.selectAll("path").attr("display", display);
  });

  $("#scaleOutput").change(function() {
    if (this.value === "" || isNaN(+this.value) || this.value < 0.01 || this.value > 10) {
      tip("Manually entered distance scale should be a number in a [0.01; 10] range");
      this.value = distanceScale.value + " " + distanceUnit.value;
      return;
    }
    distanceScale.value = +this.value;
    scaleOutput.value = this.value + " " + distanceUnit.value;
    updateCountryEditors();
  });

  $("#optionsReset").click(restoreDefaultOptions);