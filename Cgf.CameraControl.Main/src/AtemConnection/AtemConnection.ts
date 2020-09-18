import { Atem } from "atem-connection";
import { AtemConnectionConfig } from "./AtemConnectionConfig";
import StrictEventEmitter from "strict-event-emitter-types";
import { EventEmitter } from "events";

export interface IMeEvents {
  previewUpdate: (preview: number, isProgram: boolean) => void;
}

export class AtemConnection {
  private readonly mixermap = new Map<
    number,
    StrictEventEmitter<EventEmitter, IMeEvents>
  >();
  private readonly atem: Atem;
  constructor(config: AtemConnectionConfig) {
    this.atem = new Atem();

    this.atem.on("info", console.log);
    this.atem.on("error", console.error);

    this.atem.connect(config.IP);

    this.atem.on("connected", () => {
      console.log("atem connection established (" + config.IP + ")");
    });

    this.atem.on("stateChanged", (state, pathToChange) => {
      state.video.mixEffects.forEach((state, index) => {
        if (state !== undefined) {
          const emitter = this.mixermap.get(index);
          const onAirInputs = this.atem.listVisibleInputs("program");
          const newPreviewIsOnAir = onAirInputs.some(
            (input) => input === state.previewInput
          );
          emitter?.emit("previewUpdate", state.previewInput, newPreviewIsOnAir);
        }
      });
    });
  }

  previewStateUpdateEmitterGet(
    mixer: number
  ): StrictEventEmitter<EventEmitter, IMeEvents> {
    let retval = this.mixermap.get(mixer);
    if (retval) {
      return retval;
    }
    retval = new EventEmitter();
    this.mixermap.set(mixer, retval);
    return retval;
  }

  changePreview(me: number, index: number) {
    this.atem.changePreviewInput(index, me);
  }

  toggleKey(keyIndex: number, me: number) {
    if (this.atem.state !== undefined) {
      const meState = this.atem.state.video.mixEffects[me];
      if (meState !== undefined) {
        const keyState = meState.upstreamKeyers[keyIndex];
        if (keyState !== undefined) {
          this.atem.setUpstreamKeyerOnAir(!keyState.onAir, me, keyIndex);
        }
      }
    }
  }

  cut(me: number) {
    this.atem.cut(me);
  }

  auto(me: number) {
    this.atem.autoTransition(me);
  }
}
