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
        process.exit();
    }

    this.Connections = [];
    config.Connections.forEach((connection) => {
      this.Connections.push(new Connection(connection));
    });

    if (this.Connections.length == 0) {
      console.log("no connection configured");
      process.exit();
    }

    this.currentConnection = 0;

    this.state = this.idleStateGet();

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
      changeConnection(this.currentConnection + 1);
    });

    this.gamepad.onPrevious(() => {
      changeConnection(this.currentConnection - 1);
    });
  }

  changeConnection(nextConnection) {
    nextConnection = this.mod(nextConnection, this.Connections.length);

    if (this.currentConnection != nextConnection) {
      this.Connections[this.currentConnection].setState(this.idleStateGet());
      this.currentConnection = nextConnection;
      this.Connections[this.currentConnection].setState(this.state);
    }
  }

  mod(n, m) {
    return ((n % m) + m) % m;
  }

  idleStateGet() {
    return {
      pan: 0,
      tilt: 0,
      zoom: 0,
      focus: 0,
    };
  }
}

module.exports = { Controller };
