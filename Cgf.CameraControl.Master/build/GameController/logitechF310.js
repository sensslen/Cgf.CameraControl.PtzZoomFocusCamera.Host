"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logitechF310 = void 0;
var node_gamepad_1 = require("node-gamepad");
var interpolate = require("everpolate").linear;
var logitechF310 = (function () {
    function logitechF310(onPan, onTilt, onZoom, onFocus, onNext, onPrevious, padSerialNumber) {
        var _this = this;
        this.moveInterpolation = [
            [0, 50, 115, 116, 139, 140, 205, 255],
            [255, 50, 15, 0, 0, -15, -50, -255],
        ];
        if (padSerialNumber === undefined) {
            throw new Error("Unfortunately identification of controllers by serial number is not yet supported");
        }
        this.pad = new node_gamepad_1.GamePad("logitech/gamepadf310");
        this.pad.connect();
        this.pad.on("right:move", function (value) {
            var pan = interpolate(value.x, _this.moveInterpolation[0], _this.moveInterpolation[1])[0];
            onPan(Math.round(pan));
            var tilt = interpolate(value.y, _this.moveInterpolation[0], _this.moveInterpolation[1])[0];
            onTilt(Math.round(tilt));
        });
        this.pad.on("left:move", function (value) {
            onZoom(Math.round((-value.y + 127) / 16));
            onFocus(Math.round((value.x - 127) / 200));
        });
        this.pad.on("RB:press", function () {
            onNext();
        });
        this.pad.on("LB:press", function () {
            onPrevious();
        });
    }
    return logitechF310;
}());
exports.logitechF310 = logitechF310;
