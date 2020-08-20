import { logitechF310 } from "./logitechF310";
import { GameController } from "./GameController";
import { Connection } from "../Connection/Connection";
import { ConnectionConfig } from "../Connection/ConnectionConfig";
import { State } from "../State";

interface ControllerConfig {
  ControllerType: string;
  Connections: Array<ConnectionConfig>;
}

export class Controller {
  private gamepad: GameController;
  private state: State;
  private connections: Array<Connection> = [];
  private currentConnection: number = 0;

  constructor(config: ControllerConfig) {
    this.state = new State();
    switch (config.ControllerType) {
      case "logitech/gamepadf310":
        this.gamepad = new logitechF310(
          this.onPan,
          this.onTilt,
          this.onZoom,
          this.onFocus,
          this.onNext,
          this.onPrevious
        );
        break;
      default:
        console.log(`${config.ControllerType} not yet supported`);
        process.exit();
    }
    config.Connections.forEach((c) => {
      this.connections.push(new Connection(c));
    });
  }

  onPan(pan: number) {
    this.state.pan = pan;
    this.connections[this.currentConnection].setState(this.state);
  }

  onTilt(tilt: number) {
    this.state.tilt = tilt;
    this.connections[this.currentConnection].setState(this.state);
  }

  onZoom(zoom: number) {
    this.state.zoom = zoom;
    this.connections[this.currentConnection].setState(this.state);
  }

  onFocus(focus: number) {
    this.state.focus = focus;
    this.connections[this.currentConnection].setState(this.state);
  }

  onNext() {
    this.changeConnection(this.currentConnection + 1);
  }

  onPrevious() {
    this.changeConnection(this.currentConnection - 1);
  }

  changeConnection(nextConnection: number) {
    nextConnection = this.mod(nextConnection, this.connections.length);

    if (this.currentConnection != nextConnection) {
      this.connections[this.currentConnection].setState(new State());
      this.currentConnection = nextConnection;
      this.connections[this.currentConnection].setState(this.state);
      this.connections[this.currentConnection].printConnection();
    }
  }

  mod(n: number, m: number) {
    return ((n % m) + m) % m;
  }
}
