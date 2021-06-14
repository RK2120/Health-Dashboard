const socket = io();
var dataObj = {
    id: "0",
    heartrate: "0",
    spo2: "0",
    temp: "0",
};

var heartRateCtx = document.getElementById("myChart1").getContext("2d");
var temperatureCtx = document.getElementById("myChart2").getContext("2d");
var spo2Ctx = document.getElementById("myChart3").getContext("2d");

// heartRateChart.destroy();

const data2 = [45, 52, 31, 68, 84];

// chart animation

var options = {
    responsive: true,
    maintainAspectRatio: false,
};

const totalDuration = 10000;
const delayBetweenPoints = totalDuration / data2.length;
const previousY = (ctx) =>
    ctx.index === 0
        ? ctx.chart.scales.y.getPixelForValue(100)
        : ctx.chart
              .getDatasetMeta(ctx.datasetIndex)
              .data[ctx.index - 1].getProps(["y"], true).y;
const animation = {
    x: {
        type: "number",
        easing: "linear",
        duration: delayBetweenPoints,
        from: NaN, // the point is initially skipped
        delay(ctx) {
            if (ctx.type !== "data" || ctx.xStarted) {
                return 0;
            }
            ctx.xStarted = true;
            return ctx.index * delayBetweenPoints;
        },
    },
    y: {
        type: "number",
        easing: "linear",
        duration: delayBetweenPoints,
        from: previousY,
        delay(ctx) {
            if (ctx.type !== "data" || ctx.yStarted) {
                return 0;
            }
            ctx.yStarted = true;
            return ctx.index * delayBetweenPoints;
        },
    },
};

var heartRateChart = new Chart(heartRateCtx, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: "impressions",
                borderColor: "#f70403",
                data: [],
                // options: {
                //     animation,
                //     interaction: {
                //         intersect: false,
                //     },
                //     plugins: {
                //         legend: false,
                //     },
                //     scales: {
                //         x: {
                //             type: "linear",
                //         },
                //     },
                // },
                options: options,
            },
        ],
    },
    options: {
        plugins: {
            legend: {
                display: false,
            },
        },
    },
});
var temperatureChart = new Chart(temperatureCtx, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: "impressions",
                borderColor: "#f098f9",
                data: [],
                // options: {
                //     animation,
                //     interaction: {
                //         intersect: false,
                //     },
                //     plugins: {
                //         legend: false,
                //     },
                //     scales: {
                //         x: {
                //             type: "linear",
                //         },
                //     },
                // },
                options: options,
            },
        ],
    },
    options: {
        plugins: {
            legend: {
                display: false,
            },
        },
    },
});
var spo2Chart = new Chart(spo2Ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: "impressions",
                borderColor: "#0AFA75",
                data: [],
                // options: {
                //     animation,
                //     interaction: {
                //         intersect: false,
                //     },
                //     plugins: {
                //         legend: false,
                //     },
                //     scales: {
                //         x: {
                //             type: "linear",
                //         },
                //     },
                // },
                options: options,
            },
        ],
    },
    options: {
        plugins: {
            legend: {
                display: false,
            },
        },
    },
});

socket.on("connect", () => {
    console.log("WS Connected");
    getJSONQuery(dataObj);
});

socket.on("mqtt", (message) => {
    console.log("Emit captured by client");
    console.log(message);
    dataObj = message;
    const userId = Number(dataObj.id);
    const hr = Number(dataObj.heartrate);
    const temp = Number(dataObj.temp);
    const spo2 = Number(dataObj.spo2);
    $("#userId").html(userId);
    $("#heartRate").html(
        dataObj.heartrate + " <small class=" + "text-muted" + ">BPM</small>"
    );
    $("#temperature").html(
        dataObj.temp + " <small class=" + "text-muted" + ">ºC</small>"
    );
    $("#spo2").html(
        dataObj.spo2 + " <small class=" + "text-muted" + ">%</small>"
    );
    $("#heartRateCard").css = ("background-color", "red");
    switch (hr) {
        case hr < 60:
            $("#heartRateCard").css = ("background-color", "red");
            break;

        case hr < 110:
            $("#heartRateCard").css = ("color", "green");
            break;

        case hr <= 200:
            $("#heartRateCard").css = ("color", "red");
            break;

        default:
            $("#heartRateCard").css = ("color", "black");
            break;
    }
    switch (spo2) {
        case spo2 < 90:
            $("#spo2Card").css = ("color", "red");
            break;

        case spo2 < 93:
            $("#spo2Card").css = ("color", "yellow");
            break;

        case spo2 <= 100:
            $("#spo2Card").css = ("color", "green");
            break;

        default:
            $("#spo2Card").css = ("color", "black");
            break;
    }
    switch (temp) {
        case temp < 38:
            $("#temperatureCard").css = ("color", "green");
            break;

        case temp <= 50:
            $("#temperatureCard").css = ("color", "red");
            break;

        default:
            $("#temperatureCard").css = ("color", "black");
            break;
    }
    getJSONQuery(dataObj);
});

function dateFormat(timeString) {
    const event = new Date(timeString);
    const options = { day: "numeric", year: "numeric", month: "short" };
    const date = event.toLocaleString("en-US");
    return date;
}

function addData(chart, labelArr, dataArr) {
    const labelArrSliced = labelArr.slice(-6);
    const dataArrSliced = dataArr.slice(-6);

    labelArrSliced.forEach((label) =>
        chart.data.labels.push(dateFormat(label))
    );
    dataArrSliced.forEach((data) => chart.data.datasets[0].data.push(data));
    console.log(chart.data.labels.length);
    // chart.update();
}

function addShiftData(chart, labelArr, dataArr) {
    // if (
    //     chart.data.labels[chart.data.labels.length - 1] !=
    //     dateFormat(labelArr[labelArr.length - 1])
    // )

    if (chart.data.labels.length >= 5) {
        while (chart.data.labels.length > 5) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }
    }
    chart.data.labels.push(dateFormat(labelArr.pop()));
    chart.data.datasets[0].data.push(dataArr.pop());

    console.log("Chart Table");
    console.log(chart.data.labels);
    // labelArr.forEach((label) => chart.data.labels.push(label));
    // dataArr.forEach((data) => chart.data.datasets[0].data.push(data));
    // chart.update();
}

// console.log("DataOBJ outside socket");
// console.log(dataObj);

function getJSONQuery(dataObj) {
    $.getJSON("http://localhost:3000/api/" + dataObj.id, function (data) {
        console.log(data);
        heartRateArr = data.heartRateArr;
        temperatureArr = data.temperatureArr;
        spo2Arr = data.spo2Arr;
        dateArr = data.dateArr;

        /*
        const arrObj = {
            arr1: heartRateArr,
            arr2: temperatureArr,
            arr3: spo2Arr, 
            labelArr: dateArr, 
        };

        const chartObj = {
            chart1: heartRateChart,
            chart2: temperatureChart,
            chart3: spo2Chart,
        };
        */

        if (heartRateChart.data.labels.length === 0) {
            addData(heartRateChart, dateArr, heartRateArr);
            addData(temperatureChart, dateArr, temperatureArr);
            addData(spo2Chart, dateArr, spo2Arr);
            heartRateChart.update();
            temperatureChart.update();
            spo2Chart.update();
            // addData(chartObj, arrObj);
        } else {
            addShiftData(heartRateChart, dateArr, heartRateArr);
            addShiftData(temperatureChart, dateArr, temperatureArr);
            addShiftData(spo2Chart, dateArr, spo2Arr);
            heartRateChart.update();
            temperatureChart.update();
            spo2Chart.update();
            // addShiftData(chartObj, arrObj);
        }

        // heartRateChart = new Chart(heartRateCtx, {
        //     type: "line",
        //     data: {
        //         labels: [
        //             dateArr[dateArr.length - 5],
        //             dateArr[dateArr.length - 4],
        //             dateArr[dateArr.length - 3],
        //             dateArr[dateArr.length - 2],
        //             dateArr[dateArr.length - 1],
        //         ],
        //         datasets: [
        //             {
        //                 label: "impressions",
        //                 borderColor: "#ff0000",
        //                 data: [
        //                     heartRateArr[heartRateArr.length - 5],
        //                     heartRateArr[heartRateArr.length - 4],
        //                     heartRateArr[heartRateArr.length - 3],
        //                     heartRateArr[heartRateArr.length - 2],
        //                     heartRateArr[heartRateArr.length - 1],
        //                 ],
        //             },
        //         ],
        //     },
        //     options: {
        //         animation,
        //         interaction: {
        //             intersect: false,
        //         },
        //         plugins: {
        //             legend: false,
        //         },
        //         scales: {
        //             x: {
        //                 type: "linear",
        //             },
        //         },
        //     },
        // });
        // temperatureChart = new Chart(temperatureCtx, {
        //     type: "line",
        //     data: {
        //         labels: [
        //             dateArr[dateArr.length - 5],
        //             dateArr[dateArr.length - 4],
        //             dateArr[dateArr.length - 3],
        //             dateArr[dateArr.length - 2],
        //             dateArr[dateArr.length - 1],
        //         ],
        //         datasets: [
        //             {
        //                 label: "impressions",
        //                 borderColor: "#f098f9",
        //                 data: [
        //                     temperatureArr[temperatureArr.length - 5],
        //                     temperatureArr[temperatureArr.length - 4],
        //                     temperatureArr[temperatureArr.length - 3],
        //                     temperatureArr[temperatureArr.length - 2],
        //                     temperatureArr[temperatureArr.length - 1],
        //                 ],
        //             },
        //         ],
        //     },
        // });
        // spo2Chart = new Chart(spo2Ctx, {
        //     type: "line",
        //     data: {
        //         labels: [
        //             dateArr[dateArr.length - 5],
        //             dateArr[dateArr.length - 4],
        //             dateArr[dateArr.length - 3],
        //             dateArr[dateArr.length - 2],
        //             dateArr[dateArr.length - 1],
        //         ],
        //         datasets: [
        //             {
        //                 label: "impressions",
        //                 borderColor: "#0AFA75",
        //                 data: [
        //                     spo2Arr[spo2Arr.length - 5],
        //                     spo2Arr[spo2Arr.length - 4],
        //                     spo2Arr[spo2Arr.length - 3],
        //                     spo2Arr[spo2Arr.length - 2],
        //                     spo2Arr[spo2Arr.length - 1],
        //                 ],
        //             },
        //         ],
        //     },
        // });
    });
}
