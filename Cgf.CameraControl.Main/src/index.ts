import { GameController } from "./GameController/GameController";

import { default as config } from "./config.json";

config.forEach((c) => {
  new GameController(c);
});
