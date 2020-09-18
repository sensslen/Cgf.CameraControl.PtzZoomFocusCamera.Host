import StrictEventEmitter from "strict-event-emitter-types";
import { EventEmitter } from "events";

export interface IGamepadEvents {
  pan(value: number): void;
  tilt(value: number): void;
  zoom(value: number): void;
  focus(value: number): void;
  inputChange(advance: number): void;
  cut(): void;
  auto(): void;
  keyToggle(keyIndex: number): void;
}

export interface IGamePad {
  readonly keypadEvents$: StrictEventEmitter<EventEmitter, IGamepadEvents>;
  rumble(): void;
}
