import { Atem, AtemState } from "atem-connection";
import { AtemConnectionConfig } from "./AtemConnectionConfig";
import StrictEventEmitter from "strict-event-emitter-types";
import { EventEmitter } from "events";

interface MeEvents {
  previewUpdate: (preview: number, isProgram: boolean) => void;
}

export class AtemConnection {
  private readonly mixermap: Map<
    number,
    StrictEventEmitter<EventEmitter, MeEvents>
  > = new Map<number, StrictEventEmitter<EventEmitter, MeEvents>>();
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
          var emitter = this.mixermap.get(index);
          emitter?.emit(
            "previewUpdate",
            state.previewInput,
            state.previewInput === state?.programInput
          );
        }
      });
    });
  }

  onPreviewStateUpdate(
    mixer: number,
    callback: (preview: number, isProgram: boolean) => void
  ): void {
    if (!this.mixermap.has(mixer)) {
      this.mixermap.set(mixer, new EventEmitter());
    }
    const emitter = this.mixermap.get(mixer);
    emitter?.on("previewUpdate", callback);
  }

  changePreview(me: number, index: number) {
    this.atem.changePreviewInput(index, me);
  }
}
