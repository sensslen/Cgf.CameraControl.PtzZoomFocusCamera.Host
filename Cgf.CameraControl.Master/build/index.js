"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var GameController_1 = require("./GameController/GameController");
var config_json_1 = __importDefault(require("./config.json"));
config_json_1.default.forEach(function (c) {
    new GameController_1.GameController(c);
});
