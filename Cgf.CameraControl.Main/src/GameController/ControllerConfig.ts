import { CameraConnectionConfig } from "../CameraConnection/CameraConnectionConfig";
export interface ControllerConfig {
  ControllerType: string;
  AtemMixEffectBlock: number;
  AtemToggleKeyIndexes: Array<number>;
  CameraConnections: Array<CameraConnectionConfig>;
}
