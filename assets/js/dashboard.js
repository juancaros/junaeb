// const mapboxgl = require("mapbox-gl");
const mapboxToken =
  "pk.eyJ1IjoiYS12YXJnYXNtYXJ0ZSIsImEiOiJjazFxdHFyNjIwMHJwM21tbTFyMm05NGlpIn0.pfCQKKfA8WiE7VDUVOl2fA";

mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/a-vargasmarte/ck3xpzp1m2gxt1dmyttn4qiv5",
  center: [-73.05, -36.82],
  zoom: 12
});

let features;

let width = 500,
  height = 500,
  margin = { left: 50, right: 50, top: 20, bottom: 20 };

let stats = d3
  .select("#stats")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

stats
  .append("g")
  .attr("class", "yAxis")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

stats
  .append("g")
  .attr("class", "xAxis")
  .attr("transform", `translate(${margin.left}, ${margin.top + 75})`);

stats.append("g").attr("class", "barGroup");
d3.select(".barGroup")
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .attr("class", "rectGroup");

d3.select(".barGroup")
  .append("g")
  .attr("class", "statsGroup")
  .attr("transform", `translate(${margin.left},${margin.top})`);

d3.json("./data/viz/mn2017geoOutput.json").then(geojson => {
  console.log(geojson);
  let imce0Array = geojson.features.map((feature, i) => {
    return feature.properties.imce_0;
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
    .domain([d3.min(imce0Array), d3.max(imce0Array)])
    .range([0, width]);

  // use d3 to setup x and y axes
  d3.select(".yAxis")
    .transition()
    .call(d3.axisLeft(y));

  d3.select(".xAxis")
    .transition()
    .call(d3.axisBottom(x).tickSizeOuter(0));

  ///////////////////////////////

  // enter data for rect element

  d3.select(".rectGroup")
    .selectAll("rect")
    .data(["imce0"])
    .enter()
    .append("rect")
    .attr("class", "imce0-rect")
    .attr("y", d => y("Min"))
    .attr("x", d => x(d3.min(imce0Array)))
    .attr("width", x(d3.min(imce0Array)))
    .attr("height", d => y.bandwidth())
    .attr("opacity", 0)
    .transition(1000)
    .attr("opacity", 0.7)
    .attr("fill", "blue")
    .attr("width", x(d3.max(imce0Array)));

  let handleMapClick = e => {
    //   console.log(e.point);
    features = map.queryRenderedFeatures(e.point);

    if (features.length === 1) {
      console.log(features);

      let stackedFeatures = [
        {
          value: features[0].properties.imce_0,
          sampleMean: features[0].properties.imce_0Mean
        }
      ];
      const subgroups = ["value", "sampleMean"];
      let color = d3
        .scaleOrdinal()
        .domain(subgroups)
        .range(["#e41a1c", "#377eb8"]);

      let stackedData = d3.stack().keys(subgroups)(stackedFeatures);
      let schoolDiv = $("#schoolDiv");

      schoolDiv.html(`
        <h3>School ID: ${features[0].properties.idrbd}</h3>
        <h3>School Name: ${features[0].properties.NOM_RBD}</h3>
        <h3>Comuna: ${features[0].properties.NOM_COM_RBD}</h3>
        <h3>Province: ${features[0].properties.NOM_DEPROV_RBD}</h3>
        <h4>Family Size: ${features[0].properties.familySize}</h4>
        `);

      // load data
      let stat = d3
        .select(".statsGroup")
        .selectAll("line")
        .data([
          features[0].properties.imce_0,
          features[0].properties.imce_0Mean
        ]);
      // remove old lines from .statsGroup
      stat.exit().remove();

      stat
        .transition()
        .attr("y1", y("Min"))
        .attr("y2", y("Min") + y.bandwidth())
        .attr("x1", d => x(d))
        .attr("x2", d => x(d))
        .attr("stroke", "red")
        .attr("stroke-width", 4)
        .attr("stroke-dasharray", (d, i) => (i === 1 ? 4 : null));

      // add new lines to .statsGroup

      stat
        .enter()
        .append("line")
        .attr("stroke", "red")
        .transition()
        .attr("y1", y("Min"))
        .attr("y2", y("Min") + y.bandwidth())
        .attr("x1", d => x(d))
        .attr("x2", d => x(d))
        .attr("stroke", "red")
        .attr("stroke-width", 4)
        .attr("stroke-dasharray", (d, i) => (i === 1 ? 4 : null));
    }
  };
  map.on("click", handleMapClick);
});
