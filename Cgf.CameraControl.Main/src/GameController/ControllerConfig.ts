import { ImageConnectionConfig } from "../ImageConnection/ImageConnectionConfig";

export interface ControllerConfig {
  ControllerType: string;
  AtemMixEffectBlock: number;
  AtemToggleKeyIndexes: Array<number>;
  ImageConnections: Array<ImageConnectionConfig>;
}
