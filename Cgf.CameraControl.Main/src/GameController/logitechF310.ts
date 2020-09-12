import { JoyStickValue } from "./JoyStickValue";
import { CutCommand } from "atem-connection/dist/commands";

const Gamepad = require("node-gamepad");
const interpolate = require("everpolate").linear;

export class logitechF310 {
  private pad: any;
  private readonly moveInterpolation: number[][] = [
    [0, 63, 127, 128, 172, 255],
    [255, 70, 0, 0, -70, -255],
  ];

  constructor(
    onPan: (value: number) => void,
    onTilt: (value: number) => void,
    onZoom: (value: number) => void,
    onFocus: (value: number) => void,
    selectCamera: (advance: number) => void,
    cut: () => void,
    auto: () => void,
    enableKey: (index: number) => void,
    padSerialNumber?: string
  ) {
    if (!(padSerialNumber === undefined)) {
      throw new Error(
        "Unfortunately identification of controllers by serial number is not yet supported"
      );
    }
    this.pad = new Gamepad("logitech/gamepadf310");
    this.pad.connect();

    this.pad.on("left:move", (value: JoyStickValue) => {
      let pan = interpolate(
        value.x,
        this.moveInterpolation[0],
        this.moveInterpolation[1]
      )[0];
      onPan(Math.round(pan));
      let tilt = interpolate(
        value.y,
        this.moveInterpolation[0],
        this.moveInterpolation[1]
      )[0];
      onTilt(-Math.round(tilt));
    });

    this.pad.on("right:move", (value: JoyStickValue) => {
      onZoom(Math.round((-value.y + 127) / 16));
      onFocus(Math.round((value.x - 127) / 200));
    });

    this.pad.on("dpadLeft:press", () => {
      selectCamera(-1);
    });

    this.pad.on("dpadUp:press", () => {
      selectCamera(-4);
    });

    this.pad.on("dpadRight:press", () => {
      selectCamera(1);
    });

    this.pad.on("dpadDown:press", () => {
      selectCamera(4);
    });

    this.pad.on("RB:press", () => {
      cut();
    });

    this.pad.on("RT:press", () => {
      auto();
    });

    this.pad.on("A:press", () => {
      enableKey(0);
    });

    this.pad.on("B:press", () => {
      enableKey(1);
    });
  }
}
