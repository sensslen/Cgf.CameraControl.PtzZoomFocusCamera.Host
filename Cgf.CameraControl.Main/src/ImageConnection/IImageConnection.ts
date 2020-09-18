import { State } from "../State";

export interface IImageConnection {
  setState(state: State): void;
  printConnection(): void;

  readonly AtemImputNumber: number;
}
