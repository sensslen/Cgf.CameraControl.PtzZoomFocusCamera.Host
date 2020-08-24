import { GameController } from "./GameController/GameController";
import { AtemConnection } from "./AtemConnection/AtemConnection";
import Dictionary from "./Dictionary/Dictionary";

import { default as config } from "./config.json";

let atemInstances = new Dictionary<AtemConnection>();
config.AtemConnections.forEach((c) => {
  atemInstances.add(c.identifier, new AtemConnection(c));
});

config.Controllers.forEach((c) => {
  new GameController(c, atemInstances.getItem(c.AtemConnection));
});
