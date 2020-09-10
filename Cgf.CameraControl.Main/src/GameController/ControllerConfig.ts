import { CameraConnectionConfig } from "../CameraConnection/CameraConnectionConfig";
export interface ControllerConfig {
  ControllerType: string;
  AtemMixEffectBlock: number;
  CameraConnections: Array<CameraConnectionConfig>;
}
