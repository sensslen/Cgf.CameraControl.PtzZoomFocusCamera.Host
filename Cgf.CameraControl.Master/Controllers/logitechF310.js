const GamePad = require("node-gamepad");
const interpolate = require("everpolate").linear;

const moveInterpolation = [
  [0, 50, 115, 116, 139, 140, 205, 255],
  [255, 50, 15, 0, 0, -15, -50, -255],
];

class logitechF310 {
  constructor() {
    this.pad = new GamePad("logitech/gamepadf310");
    this.pad.connect();
    console.log("Connected to:%j", this.pad._usb.getDeviceInfo());
  }

  onPan(callback) {
    return this.pad.on("right:move", (value) => {
      var interpolated = interpolate(
        value.x,
        moveInterpolation[0],
        moveInterpolation[1]
      )[0];
      callback(Math.round(interpolated));
    });
  }

  onTilt(callback) {
    return this.pad.on("right:move", (value) => {
      var interpolated = interpolate(
        value.y,
        moveInterpolation[0],
        moveInterpolation[1]
      )[0];
      callback(Math.round(-interpolated));
    });
  }

  onZoom(callback) {
    return this.pad.on("left:move", (value) => {
      callback(Math.round((-value.y + 127) / 16));
    });
  }

  onFocus(callback) {
    return this.pad.on("left:move", (value) => {
      callback(Math.round((value.x - 127) / 200));
    });
  }

  onNext(callback) {
    return this.pad.on("RB:press", () => {
      callback();
    });
  }

  onPrevious(callback) {
    return this.pad.on("LB:press", () => {
      callback();
    });
  }
}
module.exports = { logitechF310 };
