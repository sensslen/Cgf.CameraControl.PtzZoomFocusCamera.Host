import { Controller } from "./GameController/Controller";

import { default as config } from "./config.json";

config.forEach((element) => {
  new Controller(element);
});
