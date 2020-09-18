import { ImageConnectionFactory } from "../ImageConnection/ImageConnectionFactory";
import { State } from "../State";
import { ControllerConfig } from "./ControllerConfig";
import { AtemConnection } from "../AtemConnection/AtemConnection";
import { IImageConnection } from "../ImageConnection/IImageConnection";
import { GamepadFactory } from "./Gamepads/GamepadFactory";
import { IGamePad } from "./Gamepads/IGamePad";

export class GameController {
  private state: State;
  private cameraConnections: Array<IImageConnection> = [];
  private currentCameraConnection?: {
    index: number;
    connection: IImageConnection;
  };
  private AtemMixEffectBlock: number;
  private pad: IGamePad;

  constructor(config: ControllerConfig, private atem: AtemConnection) {
    this.state = new State();

    this.pad = GamepadFactory.getGamepad(config);
    this.connectGamepad(config);

    config.CameraConnections.forEach((c) => {
      this.cameraConnections.push(ImageConnectionFactory.GetImageConnection(c));
    });

    this.AtemMixEffectBlock = config.AtemMixEffectBlock;
    this.atem
      .previewStateUpdateEmitterGet(this.AtemMixEffectBlock)
      .on("previewUpdate", (preview: number, isProgram: boolean) =>
        this.selectedConnectionChanged(preview, isProgram)
      );
  }

  private connectGamepad(config: ControllerConfig) {
    this.pad.keypadEvents$.on("pan", (pan) => {
      this.state.pan = pan;
      this.currentCameraConnection?.connection.setState(this.state);
    });

    this.pad.keypadEvents$.on("tilt", (tilt) => {
      this.state.tilt = tilt;
      this.currentCameraConnection?.connection.setState(this.state);
    });

    this.pad.keypadEvents$.on("zoom", (zoom) => {
      this.state.zoom = zoom;
      this.currentCameraConnection?.connection.setState(this.state);
    });

    this.pad.keypadEvents$.on("focus", (focus) => {
      this.state.focus = focus;
      this.currentCameraConnection?.connection.setState(this.state);
    });

    this.pad.keypadEvents$.on("inputChange", (advance) => {
      this.changeConnection(advance);
    });

    this.pad.keypadEvents$.on("cut", () => {
      this.atem.cut(config.AtemMixEffectBlock);
    });

    this.pad.keypadEvents$.on("auto", () => {
      this.atem.auto(config.AtemMixEffectBlock);
    });

    this.pad.keypadEvents$.on("keyToggle", (index) => {
      if (config.AtemToggleKeyIndexes[index] !== undefined) {
        this.atem.toggleKey(
          config.AtemToggleKeyIndexes[index],
          config.AtemMixEffectBlock
        );
      }
    });
  }

  changeConnection(advance: number) {
    let nextIndex = 0;
    if (this.currentCameraConnection !== undefined) {
      nextIndex = this.mod(
        this.currentCameraConnection.index + advance,
        this.cameraConnections.length
      );
    }

    this.atem.changePreview(
      this.AtemMixEffectBlock,
      this.cameraConnections[nextIndex].AtemImputNumber
    );
  }

  selectedConnectionChanged(preview: number, isProgram: boolean): void {
    if (this.currentCameraConnection !== undefined) {
      if (this.currentCameraConnection.connection.AtemImputNumber === preview) {
        return;
      }
    }

    this.currentCameraConnection = undefined;
    this.cameraConnections.forEach((connection, index) => {
      if (connection.AtemImputNumber === preview) {
        this.currentCameraConnection = { index, connection };
        if (isProgram) {
          this.pad.rumble();
        }
      }
    });
    this.printConnection();
  }

  printConnection() {
    if (this.currentCameraConnection !== undefined) {
      this.currentCameraConnection.connection.printConnection();
    } else {
      console.log("Input selected that is not managed with this application");
    }
  }

  mod(n: number, m: number) {
    return ((n % m) + m) % m;
  }
}
