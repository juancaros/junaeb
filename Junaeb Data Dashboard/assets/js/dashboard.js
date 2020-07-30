// const mapboxgl = require("mapbox-gl");
const mapboxToken =
  "pk.eyJ1IjoiYS12YXJnYXNtYXJ0ZSIsImEiOiJjazFxdHFyNjIwMHJwM21tbTFyMm05NGlpIn0.pfCQKKfA8WiE7VDUVOl2fA";

mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/a-vargasmarte/ck3xpzp1m2gxt1dmyttn4qiv5",
  center: [-73.04444, -36.8201],
  zoom: 15
});

let features;
let statArray = [
  { value: "imce_0", label: "BAZ" },
  { value: "te_0", label: "HAZ" },
  { value: "I1", label: "Time Investment" },
  { value: "S0", label: "Socioemotional Skills" }
];
let statMeanArray = statArray.map(stat => `${stat.value}Mean`);

let width = 500,
  height = 500,
  margin = { left: 400, right: 60, top: 20, bottom: 20 };

let stats = d3
  .select("#stats")
  .append("svg")
  .attr(
    "viewBox",
    `0 0 ${width + margin.left + margin.right} ${height +
      margin.top +
      margin.bottom}`
  );

stats.append("g").attr("class", "barGroup");

d3.select(".barGroup")
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .attr("class", "rectGroup");

statArray.map((stat, i) => {
  stats
    .append("g")
    .attr("class", `yAxis${stat.value}`)
    .attr(
      "transform",
      `translate(${margin.left}, ${
        i === 0 ? margin.top : margin.top * i * 5.7 + 15
      })`
    );

  stats
    .append("g")
    .attr("class", `yAxis${stat.value}right`)
    .attr(
      "transform",
      `translate(${width + margin.left}, ${
        i === 0 ? margin.top : margin.top * i * 5.7 + 15
      })`
    );

  stats
    .append("g")
    .attr("class", `xAxis${stat.value}`)
    .attr(
      "transform",
      `translate(${margin.left}, ${
        i === 0 ? margin.top + 75 : margin.top * i * 5.7 + 90
      })`
    );

  stats
    .append("text")
    .attr("text-anchor", "end")
    .text(stat.label)
    .attr(
      "transform",
      `translate(${margin.left - 100}, ${
        i === 0 ? margin.top + 45 : margin.top * i * 5.7 + 60
      })`
    );
});

d3.json("./data/viz/mn2017geoOutput.json").then(geojson => {
  let featuresArray = statArray.map(stat =>
    geojson.features.map(feature => feature.properties[stat.value])
  );

  let featuresMeanArray = statMeanArray.map(statMean =>
    geojson.features.map(feature => feature.properties[statMean])
  );

  let visData = statArray.map((stat, i) => {
    let statObject = {
      stat: stat.value,
      min: d3.min(featuresArray[i]),
      max: d3.max(featuresArray[i]),
      meanStat: `${stat.value}Mean`
    };

    statObject["domain"] = [statObject.min, statObject.max];

    return statObject;
  });

  // add y axis
  let y = d3
    .scaleBand()
    .domain(["Min"])
    .range([0, 75])
    .padding([0.2]);

  // add secondary x axis
  let y2 = d3
    .scaleBand()
    .domain(["Max"])
    .range([0, 75])
    .padding([0.2]);

  // add x axis
  let x = d3
    .scaleLinear()
    // .domain([d3.min(imce0Array), d3.max(imce0Array)])
    .range([0, width]);

  // use d3 to setup x and y axes

  visData.map(stat => {
    // console.log(stat);
    d3.select(`.yAxis${stat.stat}`)
      .transition()
      .call(d3.axisLeft(y));

    d3.select(`.yAxis${stat.stat}right`)
      .transition()
      .call(d3.axisRight(y2));

    d3.select(`.xAxis${stat.stat}`)
      .transition()
      .call(
        d3
          .axisBottom(x.domain(stat.domain))
          .tickSizeOuter(0)
          .ticks(8)
      );
  });

  ///////////////////////////////

  // enter data for rect element

  d3.select(".rectGroup")
    .selectAll("rect")
    .data(visData)
    .enter()
    .append("rect")
    .attr("class", "imce0-rect")
    .attr("y", (d, i) => (i === 0 ? y("Min") : i * y("Min") * 9 + 10))
    .attr("x", d => x.domain(d.domain)(d.min))
    .attr("width", d => x.domain(d.domain)(d.min))
    .attr("height", d => y.bandwidth())
    .transition(1000)
    .attr("fill", "#507dbc")
    .attr("width", d => x.domain(d.domain)(d.max));

  d3.select(".rectGroup")
    .selectAll("g")
    .data(visData)
    .enter()
    .append("g")
    .attr("class", "statsGroup")
    .attr("transform", (d, i) =>
      i === 0
        ? `translate(${0}, ${y("Min")})`
        : `translate(${0}, ${i * y("Min") * 9 + 10})`
    );

  // adjust font size for the viz

  stats.selectAll("text").attr("font-size", "2em");

  let handleMapClick = e => {
    //   console.log(e.point);
    features = map.queryRenderedFeatures(e.point);

    if (features.length === 1) {
      // console.log(features);

      const subgroups = ["value", "sampleMean"];
      let color = d3
        .scaleOrdinal()
        .domain(subgroups)
        .range(["#e41a1c", "#377eb8"]);
      let schoolDiv = $("#schoolDiv");

      schoolDiv.html(`
        <h3 class='school-data'>School ID: ${features[0].properties.idrbd}</h3>
        <h3 class='school-data'>Comuna: ${features[0].properties.NOM_COM_RBD}</h3>
        <h3 class='school-data'>Province: ${features[0].properties.NOM_DEPROV_RBD}</h3>
        <h3 class='school-data'>Average family size: ${features[0].properties.familySize}</h3>    
        `);

      // iterate over properties and prepare data to enter
      let schoolData = visData.map(el => {
        el["values"] = [
          features[0].properties[el.stat],
          features[0].properties[el.meanStat]
        ];
        return el;
      });

      let schoolStat = d3
        .selectAll(".statsGroup")
        .data(schoolData)
        .selectAll("line")
        .data(d => d.values);

      schoolStat.exit().remove();

      schoolStat
        .transition()
        .attr("y1", (d, i) => y("Min") - y.bandwidth() / 4)
        .attr("y2", (d, i) => +y.bandwidth())
        .attr("x1", (d, i) => x.domain(schoolData[i].domain)(d))
        .attr("x2", (d, i) => x.domain(schoolData[i].domain)(d))
        .attr("stroke", "red")
        .attr("stroke-width", 4);

      schoolStat
        .enter()
        .append("line")
        .attr("stroke", "red")
        .attr("y1", (d, i) => y("Min") - y.bandwidth() / 4)
        .attr("y2", (d, i) => +y.bandwidth())
        .attr("x1", (d, i) => x.domain(schoolData[i].domain)(d))
        .attr("x2", (d, i) => x.domain(schoolData[i].domain)(d))
        .attr("stroke-width", 4)
        .attr("stroke-dasharray", (d, i) => (i === 1 ? 4 : null));
    }
  };
  map.on("click", handleMapClick);
});
