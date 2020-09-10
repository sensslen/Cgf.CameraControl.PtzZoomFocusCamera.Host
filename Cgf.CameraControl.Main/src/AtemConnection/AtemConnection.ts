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
  private readonly multiviewmap: Map<number, number>;
  private readonly atem: Atem;
  constructor(config: AtemConnectionConfig) {
    this.atem = new Atem();

    this.atem.on("info", console.log);
    this.atem.on("error", console.error);

    this.atem.connect(config.IP);

    this.multiviewmap = new Map<number, number>(config.multiviewer);

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

  changePreview(me: number, advance: number) {
    if (this.atem.state !== undefined) {
      const meState = this.atem.state.video.mixEffects[me];
      if (meState !== undefined) {
        const selectedInput = meState.previewInput;
        const multiviewIndex = this.multiviewmap.get(me);
        if (multiviewIndex !== undefined) {
          let multiviewState = this.atem.state.settings.multiViewers[
            multiviewIndex
          ];
          if (multiviewState !== undefined) {
            let currentWindowIndex = -1;
            multiviewState.windows.forEach((window) => {
              if (window !== undefined) {
                if (window.source === selectedInput) {
                  currentWindowIndex = window.windowIndex;
                }
              }
            });
            const windowToSelect =
              multiviewState.windows[this.mod(currentWindowIndex + advance, 8)];
            if (windowToSelect !== undefined) {
              this.atem.changePreviewInput(windowToSelect.source, me);
              return;
            }
          }
        }
        this.atem.changePreviewInput(selectedInput + advance, me);
      }
    }
  }

  mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  }
}
