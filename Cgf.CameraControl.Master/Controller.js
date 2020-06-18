const { logitechF310 } = require("./Controllers/logitechF310.js");
const { Connection } = require("./Connection.js");

class Controller {
  constructor(config) {
    switch (config.ControllerType) {
      case "logitech/gamepadf310":
        this.gamepad = new logitechF310();
        break;
      default:
        console.log(`${config.ControllerType} not yet supported`);
        break;
    }

    this.Connections = [];
    config.Connections.forEach((connection) => {
      this.Connections.push(new Connection(connection));
    });

    if (this.Connections.length == 0) {
      console.log("no connection configured");
    }

    this.currentConnection = 0;

    this.state = this.emptyStateGet();

    this.gamepad.onPan((pan) => {
      this.state.pan = pan;
      this.Connections[this.currentConnection].setState(this.state);
    });

    this.gamepad.onTilt((tilt) => {
      this.state.tilt = tilt;
      this.Connections[this.currentConnection].setState(this.state);
    });

    this.gamepad.onZoom((zoom) => {
      this.state.zoom = zoom;
      this.Connections[this.currentConnection].setState(this.state);
    });

    this.gamepad.onFocus((focus) => {
      this.state.focus = focus;
      this.Connections[this.currentConnection].setState(this.state);
    });

    this.gamepad.onNext(() => {
      var nextConnection = this.currentConnection++;
      if (nextConnection > this.Connections.length) {
        nextConnection = 0;
      }
      if (this.currentConnection != nextConnection) {
        this.Connections[this.currentConnection].setState(this.emptyStateGet());
        this.currentConnection = nextConnection;
        this.Connections[this.currentConnection].setState(this.state);
      }
    });

    this.gamepad.onPrevious(() => {
      var previousConnection = this.currentconnection--;
      if (previousconnection < 0) {
        previousconnection = this.Connections.length;
      }
      if (this.currentConnection != previousConnection) {
        this.Connections[this.currentConnection].setState(this.emptyStateGet());
        this.currentConnection = previousconnection;
        this.Connections[this.currentConnection].setState(this.state);
      }
    });
  }

  emptyStateGet() {
    return {
      pan: 0,
      tilt: 0,
      zoom: 0,
      focus: 0,
    };
  }
}

module.exports = { Controller };
