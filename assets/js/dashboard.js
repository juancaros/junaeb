// const mapboxgl = require("mapbox-gl");
const mapboxToken =
  "pk.eyJ1IjoiYS12YXJnYXNtYXJ0ZSIsImEiOiJjazFxdHFyNjIwMHJwM21tbTFyMm05NGlpIn0.pfCQKKfA8WiE7VDUVOl2fA";

mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/a-vargasmarte/ck3xpzp1m2gxt1dmyttn4qiv5",
  center: [-72.024, -37.431],
  zoom: 7,
});

let handleMapClick = e => {
  //   console.log(e.point);
  let features = map.queryRenderedFeatures(e.point);

  if (features.length === 1) {
    // console.log(features);
    let schoolDiv = $("#schoolDiv");

    schoolDiv.html(`<h1>${features[0].properties.idrbd}</h1>`);
  }
};

map.on("click", handleMapClick);

// d3.json("./data/viz/geoOutput.json").then(geojson => {
//   console.log(geojson);
//   geojson.features.forEach((marker, i) => {
//     const el = $("div").attr("class", "marker");
//     console.log(i);
//     console.log(+marker.geometry.coordinates[0]);
//     new mapboxgl.Marker(el)
//       .setLngLat([
//         +marker.geometry.coordinates[0],
//         +marker.geometry.coordinates[1],
//       ])
//       .addTo(map);
//   });
// });
