// declare svg margin and dimensions

(margin = { left: 70, right: 60, top: 100, bottom: 50 }),
  (width = 600 - margin.left - margin.right),
  (height = 500 - margin.top - margin.bottom);

let cleanData;
let value;
let by;

// append svg to #boxplot

const boxSvg = d3
  .select("#boxplot")
  .append("svg")
  .attr(
    "viewBox",
    `0 0 ${width + margin.left + margin.right} ${height +
      margin.top +
      margin.bottom}`
  )
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

/////////////////////// SCALES /////////////////////////

// create x scale
let x = d3
  .scaleBand()
  .range([0, width])
  .domain(["pre-k", "K", "1st Grade"])
  .paddingInner(1)
  .paddingOuter(0.5);

boxSvg
  .append("g")
  .attr("class", "boxXAxisGroup axis")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x));

// create y scale
let y = d3.scaleLinear().range([height, 0]);

boxSvg
  .append("g")
  .attr("class", "boxYAxisGroup axis")
  .call(d3.axisLeft(y));

////////////////////////// AXES LABELS ////////////////////////

// append labels to axes

boxSvg
  .append("text")
  .attr("class", "yLabelText")
  .attr(
    "transform",
    `translate(${-margin.right / 1.2}, ${height / 2}) rotate(-90)`
  )
  .attr("text-anchor", `middle`)
  .attr("font-size", "22px")
  .text($("#boxplot-select")[0].value);

boxSvg
  .append("text")
  .attr("transform", `translate(${width / 2}, ${height + margin.bottom})`)
  .attr("text-anchor", `middle`)
  .attr("font-size", "20px")
  .text("Grade");

//////////////////////// LEGEND /////////////////////////////////
// boxSvg
//   .selectAll(".legendText")
//   .data([0, 1])
//   .append("text")
//   .attr("class", ".legendText")
//   .attr("x", (d, i) => {
//     // console.log(d);
//     return i * (width / 2) + width / 3.5;
//   })
//   .attr("y", -margin.bottom + 25 / 2)
//   .text(d => {
//     // console.log(d);
//     return d;
//   });

///////////////////////// LOAD DATA ////////////////////////////
///////////////////////////////////////////////////////////////

d3.csv("./data/viz/boxplot.csv")
  .then(data => {
    value = $("#boxplot-select")[0].value;
    by = $("#boxplot-select-by")[0].value;
    cleanData = data;
    // console.log(value, by);

    // run first iteration
    updateBox(cleanData, value, by);
  })
  .catch(err => err);

$("#boxplot-select").on("change", () =>
  updateBox(
    cleanData,
    $("#boxplot-select")[0].value,
    $("#boxplot-select-by")[0].value
  )
);

$("#boxplot-select-by").on("change", () => {
  updateBox(
    cleanData,
    $("#boxplot-select")[0].value,
    $("#boxplot-select-by")[0].value
  );
});

updateBox = (data, value, by) => {
  ///////////////// DATA TRANSFORMATION ///////////////////

  // compute quartiles, median, interquartile range, min, and max from our metrics of interest
  const nesting = ["Grade", by];
  let sumStat = d3.nest();

  nesting.forEach(key => sumStat.key(d => d[key]));

  sumStat = sumStat
    .rollup(d => {
      let q1 = d3.quantile(d.map(g => g[value]).sort(d3.ascending), 0.25),
        median = d3.quantile(d.map(g => g[value]).sort(d3.ascending), 0.5),
        q3 = d3.quantile(d.map(g => g[value]).sort(d3.ascending), 0.75),
        interQuantileRange = q3 - q1,
        min = q1 - 1.5 * interQuantileRange,
        max = q3 + 1.5 * interQuantileRange,
        parent = d.map(g => g.Grade)[0];

      return {
        q1: q1,
        median: median,
        q3: q3,
        interQuantileRange: interQuantileRange,
        min: min,
        max: max,
        parent: parent
      };
    })
    .entries(data);

  let subgroupStats = [];

  sumStat.map(grade => {
    // console.log(grade);
    grade.values.map(sexgroups => {
      // console.log(sexgroups);
      subgroupStats.push(sexgroups);
    });
  });
  /////////////////////////////////////////////////////////////////
  ///////////////////////////SCALE AXES///////////////////////////
  y.domain([
    d3.min(
      sumStat.map(grade => d3.min(grade.values.map(group => group.value.min)))
    ) * 1.12,
    d3.max(
      sumStat.map(grade => d3.max(grade.values.map(group => group.value.max)))
    ) * 1.12
  ]);

  d3.select(".boxYAxisGroup")
    .transition(500)
    .call(d3.axisLeft(y));

  d3.select(".yLabelText")
    .transition(500)
    .text(value);

  /////////////////////// DATA LIFECYCLE //////////////////////////////
  /////////////////////////////////////////////////////////////////////

  // load data for vertical lines
  let verticalLines = boxSvg.selectAll(".vertline").data(subgroupStats);

  // remove old data from vertical lines
  verticalLines.exit().remove();
  // add new data to create vertical lines
  verticalLines
    .enter()
    .append("line")
    .attr("class", "vertline")
    .attr("x1", (d, i) =>
      (i + 1) % 2 === 0 ? x(d.value.parent) - 30 : x(d.value.parent) + 30
    )
    .attr("x2", (d, i) =>
      (i + 1) % 2 === 0 ? x(d.value.parent) - 30 : x(d.value.parent) + 30
    )
    .attr("y1", d => y(d.value.min))
    .attr("y2", d => y(d.value.max))
    .attr("stroke", "black")
    .style("width", 40);

  // append rectangle for each boxplot

  let boxWidth = 50;

  // load data to create each boxplot box
  let box = boxSvg.selectAll(".rect-box").data(subgroupStats);
  // console.log(subgroupStats);

  // remove old data from box
  box.exit().remove();

  // add new data to creat new boxes

  box
    .enter()
    .append("rect")
    .attr("class", "rect-box")
    .attr("x", (d, i) =>
      (i + 1) % 2 === 0
        ? x(d.value.parent) - boxWidth / 2 - 30
        : x(d.value.parent) - boxWidth / 2 + 30
    )
    .attr("y", (d, i) => y(d.value.q3))
    .attr("height", d => y(d.value.q1) - y(d.value.q3))
    .attr("width", boxWidth)
    .attr("stroke", "black")
    .style("fill", "#507DBC")
    .attr("opacity", (d, i) => ((i + 1) % 2 === 0 ? 1 : 0.7));

  // load data to create median lines
  let median = boxSvg.selectAll(".medianLine").data(subgroupStats);

  // remove old data from median boxes
  median.exit().remove();

  // outline median
  median
    .enter()
    .append("line")
    .attr("class", "medianLine")
    .attr("x1", (d, i) =>
      (i + 1) % 2 === 0
        ? x(d.value.parent) - boxWidth / 2 - 30
        : x(d.value.parent) - boxWidth / 2 + 30
    )
    .attr("x2", (d, i) =>
      (i + 1) % 2 === 0
        ? x(d.value.parent) + boxWidth / 2 - 30
        : x(d.value.parent) + boxWidth / 2 + 30
    )
    .attr("y1", d => y(d.value.median))
    .attr("y2", d => y(d.value.median))
    .attr("stroke", "black")
    .style("width", 80);

  // append legends to the svg
  const legendSize = 25;
  let legendBoxes = Array.from(new Set(subgroupStats.map(stat => stat.key)));
  let legendNames = legendBoxes;
  // console.log(legendNames);

  // load data to create legend and legendText
  let legend = boxSvg.selectAll(".legend").data(legendBoxes);

  // console.log(legendText);

  // remove old from legend and legendText
  legend.exit().remove();

  // add new data to create legend and legendText
  legend
    .enter()
    .append("rect")
    .attr("class", "legend")
    .attr("x", (d, i) => i * (width / 2) + width / 5)
    .attr("y", -margin.bottom)
    .attr("height", legendSize)
    .attr("width", legendSize)
    .attr("stroke", "black")
    .style("fill", "#507DBC")
    .attr("opacity", (d, i) => (i % 2 === 0 ? 1 : 0.7));

  let legendText = boxSvg.selectAll(".legendText").data(legendNames);

  legendText.exit().remove();

  legendText
    .enter()
    .append("text")
    .attr("class", "legendText")
    .attr("x", (d, i) => i * (width / 2) + width / 3.5)
    .attr("y", -margin.bottom + legendSize / 1.2);

  d3.selectAll(".legendText").text(d => d);
};
