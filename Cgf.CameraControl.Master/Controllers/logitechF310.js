const GamePad = require("node-gamepad");

class logitechF310 {
  constructor() {
    this.pad = new GamePad("logitech/gamepadf310");
    this.pad.connect();
  }

  dest;

  onPan(callback) {
    return this.pad.on("right:move", (value) => {
      var pan = Math.round((-value.x + 127.5) * 2);
      callback(Math.abs(pan) < 20 ? 0 : pan);
    });
  }

  onTilt(callback) {
    return this.pad.on("right:move", (value) => {
      var tilt = Math.round((-value.y + 127.5) * 2);
      callback(Math.abs(tilt) < 20 ? 0 : tilt);
    });
  }

  onZoom(callback) {
    return this.pad.on("left:move", (value) => {
      callback(Math.round((-value.y + 127) / 16));
    });
  }

  onFocus(callback) {
    return this.pad.on("left:move", (value) => {
      callback(Math.round((value.x - 127) / 64));
    });
  }
}
module.exports = { logitechF310 };
