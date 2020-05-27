#!/usr/bin/env node
const https = require("https");
const inquirer = require("inquirer");
const axios = require("axios").create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

var GamePad = require("node-gamepad");

function queryConnection(successCallback, errorCallback) {
  axios
    .get("https://localhost:5001/pantiltzoom/connections")
    .then((response) => {
      inquirer
        .prompt([
          {
            type: "list",
            name: "connection",
            message: "Which connection do you want to connect to?",
            choices: response.data,
          },
        ])
        .then((answers) => {
          var connection = {
            connectionName: answers.connection,
            connected: true,
          };
          axios
            .put("https://localhost:5001/pantiltzoom/connection", connection)
            .then((response) => successCallback(response))
            .catch((error) => {
              queryConnection(successCallback, errorCallback);
            });
        });
    })
    .catch((error) => errorCallback(error));
}

queryConnection(
  () => console.log("connection established"),
  (error) => console.log(error)
);

var controller = new GamePad("logitech/gamepadf310");
controller.connect();

let state = {
  pan: 0,
  tilt: 0,
  zoom: 0,
  focus: 0,
};

var sending = false;
function send() {
  axios
    .put("https://localhost:5001/pantiltzoom/state", state)
    .then((response) => console.log("yay"))
    .catch((error) => console.log(error));
}

controller.on("left:move", (value) => {
  state.zoom = Math.round((-value.y + 127) / 16);
  state.focus = Math.round((value.x - 127) / 64);
  send();
});

controller.on("right:move", (value) => {
  var tilt = Math.round((-value.y + 127.5) * 2);
  state.tilt = Math.abs(tilt) < 20 ? 0 : tilt;

  var pan = Math.round((-value.x + 127.5) * 2);
  state.pan = Math.abs(pan) < 20 ? 0 : pan;
  send();
});
