import { State } from "../State";
import { IImageConnection } from "./IImageConnection";
import { ImageConnectionConfig } from "./ImageConnectionConfig";

export abstract class AbstractImageConnection implements IImageConnection {
  public abstract setState(state: State): void;
  public abstract printConnection(): void;

  constructor(private config: ImageConnectionConfig) {}
  public get AtemImputNumber(): number {
    return this.config.AtemInputNumber;
  }

  protected printConnectionWithAdditionalInfo(additionalInfo?: string): void {
    console.log(
      `${this.config.ConnectionName} - ${this.AtemImputNumber} ${
        additionalInfo ? `(${additionalInfo})` : ""
      }`
    );
  }
}
