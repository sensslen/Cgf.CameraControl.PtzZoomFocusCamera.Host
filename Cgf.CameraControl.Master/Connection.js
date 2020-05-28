const https = require("https");
const axios = require("axios");

class Connection {
  constructor(config) {
    this.shoudlTransmit = false;
    this.canTransmit = false;
    this.connectionUrl = config.ConnectionUrl;
    this.connectionPort = config.ConnectionPort;
    this.axios = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
    this.Connect();
  }

  Connect() {
    this.axios
      .get(this.connectionUrl + "/pantiltzoom/connections")
      .then((response) => {
        if (!response.data.includes(this.connectionPort)) {
          console.log("Port:" + this.connectionPort + "is not available.");
        } else {
          var connection = {
            connectionName: this.connectionPort,
            connected: true,
          };
          this.axios
            .put(this.connectionUrl + "/pantiltzoom/connection", connection)
            .then(() => {
              this.canTransmit = true;
              this.transmitNextStateIfRequestedAndPossible();
            })
            .catch((error) => {
              console.log("Failed to connect to Port:" + this.connectionPort);
              console.log("error:" + error);
            });
        }
      })
      .catch((error) => {
        console.log("Failed to connect:" + this.connectionUrl);
        console.log("error:" + error);
      });
  }

  transmitNextStateIfRequestedAndPossible() {
    if (!this.canTransmit) {
      return;
    }
    if (!this.shoudlTransmit) {
      return;
    }
    this.canTransmit = false;
    this.shoudlTransmit = false;
    this.axios
      .put(this.connectionUrl + "/pantiltzoom/state", this.state)
      .then(() => {
        this.transmitNextStateIfRequestedAndPossible();
        this.canTransmit = true;
      })
      .catch((error) => console.log(error));
  }

  setState(state) {
    this.state = state;
    this.shoudlTransmit = true;
    this.transmitNextStateIfRequestedAndPossible();
  }
}

module.exports = { Connection };
