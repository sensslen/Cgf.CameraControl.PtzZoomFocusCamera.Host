import { CameraConnectionConfig } from "../CameraConnection/CameraConnectionConfig";
export interface ControllerConfig {
  ControllerType: string;
  CameraConnections: Array<CameraConnectionConfig>;
}
