import { logitechF310 } from "./logitechF310";
import { CameraConnection } from "../ImageConnection/CameraConnection/CameraConnection";
import { State } from "../State";
import { ControllerConfig } from "./ControllerConfig";
import { AtemConnection } from "../AtemConnection/AtemConnection";
import { Atem } from "atem-connection";

export class GameController {
  private state: State;
  private cameraConnections = new Map<number, CameraConnection>();
  private currentInputSelected: number = 0;
  private AtemMixEffectBlock: number;

  constructor(config: ControllerConfig, private atem: AtemConnection) {
    this.state = new State();
    switch (config.ControllerType) {
      case "logitech/gamepadf310":
        new logitechF310(
          (pan: number) => {
            this.state.pan = pan;
            this.transmitState(this.state, this.currentInputSelected);
          },
          (tilt: number) => {
            this.state.tilt = tilt;
            this.transmitState(this.state, this.currentInputSelected);
          },
          (zoom: number) => {
            this.state.zoom = zoom;
            this.transmitState(this.state, this.currentInputSelected);
          },
          (focus: number) => {
            this.state.focus = focus;
            this.transmitState(this.state, this.currentInputSelected);
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
      this.cameraConnections.set(c.AtemInputNumber, new CameraConnection(c));
    });

    this.AtemMixEffectBlock = config.AtemMixEffectBlock;
    this.atem.onPreviewStateUpdate(
      this.AtemMixEffectBlock,
      (preview: number, isProgram: boolean) =>
        this.selectedConnectionChanged(preview, isProgram)
    );
  }

  transmitState(transmitState: State, connectionNumber: number) {
    if (this.cameraConnections.has(connectionNumber)) {
      this.cameraConnections.get(connectionNumber)?.setState(transmitState);
    }
  }

  changeConnection(advance: number) {
    this.atem.changePreview(this.AtemMixEffectBlock, advance);
  }

  selectedConnectionChanged(preview: number, isProgram: boolean): void {
    this.currentInputSelected = preview;
  }
}
