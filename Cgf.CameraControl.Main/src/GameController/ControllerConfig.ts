import { ImageConnectionConfig } from "../ImageConnection/ImageConnectionConfig";

export interface ControllerConfig {
  ControllerType: string;
  AtemMixEffectBlock: number;
  AtemToggleKeyIndexes: Array<number>;
  CameraConnections: Array<ImageConnectionConfig>;
}
