d3.csv("./data/viz/boxplot.csv")
  .then(data => {
    console.log(data);
  })
  .catch(err => err);
