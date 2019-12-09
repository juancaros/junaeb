// const mapboxgl = require("mapbox-gl");
const mapboxToken =
  "pk.eyJ1IjoiYS12YXJnYXNtYXJ0ZSIsImEiOiJjazFxdHFyNjIwMHJwM21tbTFyMm05NGlpIn0.pfCQKKfA8WiE7VDUVOl2fA";

mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/a-vargasmarte/ck3xpzp1m2gxt1dmyttn4qiv5",
  center: [-70.6693, -33.4489],
  zoom: 12,
});

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
