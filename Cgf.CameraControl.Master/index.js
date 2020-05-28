#!/usr/bin/env node
const { Controller } = require("./Controller.js");

const config = require("./config.json");

config.forEach((element) => {
  new Controller(element);
});
