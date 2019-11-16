// Gapminder clone visualization

// create margins for plot
const margin = { left: 80, right: 20, top: 50, bottom: 100 };

// set up width and height of the plot
const width = 700 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// declare time variable
let time = 0;

// declare interval variable
let interval;

// declare cleanData variable
let cleanData;

// build svg canvass and append group element
let g = d3
  .select("#chart-area") //select the chart area
  .append("svg") //append an svg element
  // add width and height attributes
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g") //append a group element to the svg element
  //transform to leave room from the left and the top
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// -------------- BUILD AXES -----------------
// define axes groups
const xAxisGroup = g
  .append("g")
  .attr("class", "x axis")
  // translate the x axis to the bottom of the chart
  .attr(`transform`, `translate(0, ${height})`);

const yAxisGroup = g.append("g").attr("class", "y axis");

//   -------------- BUILD SCALES ----------------
// Build Scales

// X Scale = linear scale for 'puntaje' values
const x = d3
  .scaleLinear()
  .range([0, width])
  .domain([300, 900]);

// Y Scale => linear scale for 'ingreso2' values
const y = d3
  .scaleLinear()
  .range([height, 0])
  .domain([0, 800]);

// Radius Scale
//   const area = d3
//     .scaleLinear()
//     .range([25 * Math.PI, 1500 * Math.PI])
//     .domain([2000, 1400000000]);

// Color Scale for 'area' values
const areaColor = d3.scaleOrdinal(d3.schemeCategory10);

//   ----------- BUILD LABELS -----------
// X Label
g.append("text")
  .attr("y", height + 50)
  .attr("x", width / 2)
  .attr("font-size", `20px`)
  .attr("text-anchor", `middle`)
  .text("Standardized Score Results");

// Y Label
const yLabel = g
  .append("text")
  .attr("y", -60)
  .attr("x", -(height / 2))
  .attr("font-size", `20px`)
  .attr("text-anchor", `middle`)
  .attr("transform", `rotate(-90)`)
  .text("Enrollment Size");

// Year Label
const yearLabel = g
  .append("text")
  .attr("y", height - 10)
  .attr("x", width - 40)
  .attr("font-size", "40px")
  .attr("opacity", "0.4")
  .attr("text-anchor", "middle")
  .text("2013");

// ---------------- INTEGRATE AXES AND SCALES -----------------
// X Axis
const xAxisCall = d3.axisBottom(x);
xAxisGroup.call(xAxisCall);

// Y Axis
const yAxisCall = d3.axisLeft(y);
yAxisGroup.call(yAxisCall);

d3.json("data/viz/output.json").then(data => {
  console.log(data);

  //   ---------- BUILD LEGENDS -----------
  const areas = [];

  data.map(year => {
    console.log(year);
    year.areas.map(area => {
      areas.push(area.area);
    });
  });

  const uniqueAreas = Array.from(new Set(areas));
  const legend = g
    .append("g")
    .attr("transform", `translate(${width - 10}, ${height - 200})`);

  uniqueAreas.forEach((area, i) => {
    const legendRow = legend
      .append("g")
      .attr("transform", `translate(0, ${i * 20})`);
    // append the color of the legendRow
    legendRow
      .append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", areaColor(area));
    // append the text of the area
    legendRow
      .append("text")
      .attr("x", -10)
      .attr("y", 10)
      .attr("text-anchor", "end")
      .style("text-transform", "capitalize")
      .text(area);
  });

  //   run the first iteration of the viz

  cleanData = data;
  update(cleanData[0].areas);
});

// play button click handler
$("#play-button").on("click", () => {
  if ($("#play-button").text() === "Play") {
    $("#play-button").text("Pause");
    interval = setInterval(step, 1000);
  } else {
    $("#play-button").text("Play");
    clearInterval(interval);
  }
});

$("#reset-button").on("click", () => {
  time = 0;
  update(cleanData[time].areas);
});

// area dropdown change handler
$("#area-select").on("change", () => {
  update(cleanData[time].areas);
});

function step() {
  time = time < 7 ? time + 1 : 0;
  update(cleanData[time].areas);
}

update = data => {
  console.log(data);
  let area = $("#area-select").val();

  data = data.filter(d => {
    if (area === "All") {
      return true;
    } else {
      console.log(d.area === area);
      return d.area === area;
    }
  });
  console.log(data);

  // build transition
  const t = d3.transition().duration(1000);

  // JOIN new data with old elements
  const circles = g
    .selectAll("circle")
    //use the .data method to attach data to our plot
    .data(data, d => {
      return d.area;
    });

  // EXIT old elements not present in new data
  circles.exit().remove();
  // ENTER new elements present in new data
  circles
    .enter()
    .append("circle")
    .attr("class", "enter")
    .attr("fill", d => {
      return areaColor(d.area);
    })
    // .on("mouseover", tip.show) //provide tip.show method on mouseover
    // .on("mouseout", tip.hide) // provide the tip.hide method on mouseout
    .merge(circles)
    .transition(t)
    .attr("cy", d => {
      return y(d.ingreso2);
    })
    .attr(`cx`, d => {
      return x(d.puntaje);
    })
    .attr("r", d => {
      return 3;
    });

  // update time labels as time goes along
  yearLabel.text(+(time + 2013));
  console.log($("#year")[0]);
  $("#year")[0].innerHTML = +(time + 2013);
};
