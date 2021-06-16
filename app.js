//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mqtt = require("mqtt");
const Influx = require("influx");
const { Schema } = require("influx/lib/src/schema");
const axios = require("axios");
const fetch = require("node-fetch");
const { result } = require("lodash");

const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

var content = {
    heartRate: 0,
    temperature: 0,
    spo2: 0,
    id: 0,
    kioskId: 0,
};

var contentArr = {
    heartRateArr: [],
    temperatureArr: [],
    spo2Arr: [],
    dateArr: [],
};

const influx = new Influx.InfluxDB({
    database: "test",
    host: "192.168.2.30",
    port: 8086,
    username: "admin",
    password: "password",
});

const client = mqtt.connect("mqtt://192.168.2.30:1883");

client.on("connect", function () {
    client.subscribe("/sensordata", function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on("message", function (topic, message) {
    // message is Buffer
    // if (message.toString() === "Hello mqtt") {
    //     console.log(topic);
    //     console.log(message.toString());
    // }

    if (topic === "/sensordata") {
        dataObj = JSON.parse(message.toString());
        // console.log(JSON.parse(message.toString()));
        content.id = dataObj.id;
        content.kioskId = dataObj.kioskId;
        content.heartRate = dataObj.heartrate;
        content.spo2 = dataObj.spo2;
        content.temperature = dataObj.temp;
    }
    io.emit("mqtt", dataObj);
    // console.log(content);
});

app.get("/", (req, res) => {
    res.redirect("/dashboard");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/contact", (req, res) => {
    res.render("contact");
});

app.get("/how_it_works", (req, res) => {
    res.render("about");
});

app.get("/dashboard", (req, res) => {
    // fetch("http://localhost:3000/api").then((result) => {
    //     console.log("Inside /dashboard");
    //     console.log(result.json());
    // });

    console.log(content);
    console.log(req.body);
    res.render("dashboard", {
        content: content,
        // id: id,
        // heartRateArr: contentArr.heartRateArr,
        // dateArr: contentArr.dateArr,
    });
});

app.get("/api/:id", (request, response) => {
    // fetch(
    //     "http://192.168.2.30:8086/query?pretty=true&db=test&q=SELECT%20*%20FROM%20%22test%22%20ORDER%20BY%20time%20DESC%20LIMIT%205"
    // )
    let contentArr = {
        heartRateArr: [],
        temperatureArr: [],
        spo2Arr: [],
        dateArr: [],
    };

    influx
        .query(
            "select * from sensorData where id = '" + request.params.id + "'"
        )
        .then((result) => {
            result.forEach((dataItem) => {
                contentArr.heartRateArr.push(dataItem.heartrate);
                contentArr.temperatureArr.push(dataItem.temp);
                contentArr.spo2Arr.push(dataItem.spo2);
                contentArr.dateArr.push(dataItem.time);
            });
            response.status(200).json(contentArr);
            // response.status(200).json(result);
        })
        .catch((error) => response.status(500).json({ error }));
});

// app.post("/login", (req, res) => {
//     res.redirect("/dashboard");
// });

server.listen(3000, function () {
    console.log("Server started on port 3000");
});

// //------------

// console.log("Inside app.js");
