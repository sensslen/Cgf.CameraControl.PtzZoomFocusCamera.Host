import { Atem } from "atem-connection";
import { AtemConnectionConfig } from "./AtemConnectionConfig";

export class AtemConnection {
  private readonly atem: Atem;
  constructor(config: AtemConnectionConfig) {
    this.atem = new Atem();

    this.atem.on("info", console.log);
    this.atem.on("error", console.error);

    this.atem.connect(config.IP);

    this.atem.on("connected", () => {
      console.log("atem connection established (" + config.IP + ")");
    });

    this.atem.on("stateChanged", (state, pathToChange) => {
      console.log("state:" + state + "\tpathToChange:" + pathToChange); // log information in order to get to know what can be done here
    });
  }
}
