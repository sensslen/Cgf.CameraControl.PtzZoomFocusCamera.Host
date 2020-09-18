import { State } from "../State";
import { AbstractImageConnection } from "./AbstractImageConnection";
import { ImageConnectionConfig } from "./ImageConnectionConfig";

export class ImageConnection extends AbstractImageConnection {
  constructor(config: ImageConnectionConfig) {
    super(config);
  }

  setState(state: State): void {
    // do nothing intentionally - we cannot send a state to this connection
  }

  printConnection(): void {
    this.printConnectionWithAdditionalInfo();
  }
}
