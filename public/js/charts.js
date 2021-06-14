var Chart = require("chart.js");

var ctx = document.getElementById("myChart1").getContext("2d");
// chart
chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: ["week1", "week2", "week3"],
        datasets: [
            {
                label: "impressions",
                borderColor: "#ff0000",
                data: [450, 375, 680],
            },
            {
                label: "clicks",
                borderColor: "#0000ff",
                data: [70, 20, 120],
            },
        ],
    },
});
