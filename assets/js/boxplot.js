d3.csv("./data/viz/boxplot.csv")
  .then(data => {
    console.log(data);
    let margin = { left: 70, right: 30, top: 20, bottom: 50 },
      width = 600 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // append svg to #boxplot

    const boxSvg = d3
      .select("#boxplot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // compute quartiles, median, interquartile range, min, and max from our metrics of interest
    const nesting = ["Grade", "Sex"];
    let sumStat = d3.nest();

    console.log(sumStat);

    nesting.forEach(key => sumStat.key(d => d[key]));
    // .key(d => d.Grade)
    sumStat = sumStat
      .rollup(d => {
        let q1 = d3.quantile(d.map(g => g.BAZ).sort(d3.ascending), 0.25),
          median = d3.quantile(d.map(g => g.BAZ).sort(d3.ascending), 0.5),
          q3 = d3.quantile(d.map(g => g.BAZ).sort(d3.ascending), 0.75),
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

    console.log(sumStat);

    // create x scale
    let x = d3
      .scaleBand()
      .range([0, width])
      .domain(["pre-k", "K", "1st Grade"])
      .paddingInner(1)
      .paddingOuter(0.5);

    boxSvg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    // create y scale
    let y = d3
      .scaleLinear()
      .domain([
        d3.min(
          sumStat.map(grade =>
            d3.min(grade.values.map(group => group.value.min))
          )
        ) * 1.12,
        d3.max(
          sumStat.map(grade =>
            d3.max(grade.values.map(group => group.value.max))
          )
        ) * 1.12
      ])
      .range([height, 0]);

    boxSvg.append("g").call(d3.axisLeft(y));

    let subgroupStats = [];

    sumStat.map(grade => {
      // console.log(grade);
      grade.values.map(sexgroups => {
        console.log(sexgroups);
        subgroupStats.push(sexgroups);
      });
    });
    console.log(subgroupStats);

    // Show the main vertical line

    boxSvg
      .selectAll("vertlines")
      .data(subgroupStats)
      .enter()
      .append("line")
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

    boxSvg
      .selectAll("boxes")
      .data(subgroupStats)
      .enter()
      .append("rect")
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
      .attr("opacity", (d, i) => (i % 2 === 0 ? 1 : 0.7));

    // outline median
    boxSvg
      .selectAll("medianLines")
      .data(subgroupStats)
      .enter()
      .append("line")
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

    // append labels to axes

    boxSvg
      .append("text")
      .attr(
        "transform",
        `translate(${-margin.right}, ${height / 2}) rotate(-90)`
      )
      .attr("text-anchor", `middle`)
      .text("BAZ");

    boxSvg
      .append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom})`)
      .attr("text-anchor", `middle`)
      .text("Grade");

    console.log(sumStat);
  })
  .catch(err => err);
