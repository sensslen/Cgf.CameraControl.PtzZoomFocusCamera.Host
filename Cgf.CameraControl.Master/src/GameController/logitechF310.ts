const Gamepad = require("node-gamepad");
const interpolate = require("everpolate").linear;

interface JoyStickValue {
  x: number;
  y: number;
}

export class logitechF310 {
  private pad: any;
  private readonly moveInterpolation: number[][] = [
    [0, 50, 115, 116, 139, 140, 205, 255],
    [255, 50, 15, 0, 0, -15, -50, -255],
  ];

  constructor(
    onPan: (value: number) => void,
    onTilt: (value: number) => void,
    onZoom: (value: number) => void,
    onFocus: (value: number) => void,
    selectCamera: (advance: number) => void,
    toggleAutofocus: () => void,
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
      var pan = interpolate(
        value.x,
        this.moveInterpolation[0],
        this.moveInterpolation[1]
      )[0];
      onPan(Math.round(pan));
      var tilt = interpolate(
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
      toggleAutofocus();
    });

    this.pad.on("LB:press", () => {
      toggleAutofocus();
    });
  }
}
