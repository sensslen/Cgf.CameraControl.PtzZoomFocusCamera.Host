import { logitechF310 } from "./logitechF310";
import { CameraConnection } from "../CameraConnection/CameraConnection";
import { State } from "../State";
import { ControllerConfig } from "./ControllerConfig";
import { AtemConnection } from "../AtemConnection/AtemConnection";

export class GameController {
  private state: State;
  private cameraConnections: Array<CameraConnection> = [];
  private currentCameraConnection?: {
    index: number;
    connection: CameraConnection;
  };
  private AtemMixEffectBlock: number;

  constructor(config: ControllerConfig, private atem: AtemConnection) {
    this.state = new State();
    switch (config.ControllerType) {
      case "logitech/gamepadf310":
        new logitechF310(
          (pan: number) => {
            this.state.pan = pan;
            this.currentCameraConnection?.connection.setState(this.state);
          },
          (tilt: number) => {
            this.state.tilt = tilt;
            this.currentCameraConnection?.connection.setState(this.state);
          },
          (zoom: number) => {
            this.state.zoom = zoom;
            this.currentCameraConnection?.connection.setState(this.state);
          },
          (focus: number) => {
            this.state.focus = focus;
            this.currentCameraConnection?.connection.setState(this.state);
          },
          (advance: number) => {
            this.changeConnection(advance);
          },
          () => {}
        );
        break;
      default:
        console.log(`${config.ControllerType} not yet supported`);
        process.exit();
    }
    config.CameraConnections.forEach((c) => {
      this.cameraConnections.push(new CameraConnection(c));
    });

    this.AtemMixEffectBlock = config.AtemMixEffectBlock;
    this.atem.onPreviewStateUpdate(
      this.AtemMixEffectBlock,
      (preview: number, isProgram: boolean) =>
        this.selectedConnectionChanged(preview, isProgram)
    );
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
      if (this.currentCameraConnection.index === preview) {
        return;
      }
    }

    this.currentCameraConnection = undefined;
    this.cameraConnections.forEach((connection, index) => {
      if (connection.AtemImputNumber === preview) {
        connection.printConnection();
        this.currentCameraConnection = { index, connection };
        return;
      }
    });
    console.log("Selected input that is not a camera");
  }

  mod(n: number, m: number) {
    return ((n % m) + m) % m;
  }
}
