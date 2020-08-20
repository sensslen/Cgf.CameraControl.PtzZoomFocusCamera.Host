import { GameController } from "./GameController/GameController";
import { AtemConnection } from "./AtemConnection/AtemConnection";

import { default as config } from "./config.json";

var atemInstances: Record<string, AtemConnection>;
config.AtemConnections.forEach((c) => {
  atemInstances[c.identifier] = new AtemConnection(c);
});

config.Controllers.forEach((c) => {
  new GameController(c, atemInstances[c.AtemConnection]);
});
