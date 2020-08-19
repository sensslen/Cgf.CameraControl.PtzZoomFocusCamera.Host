const https = require("https");
const axios = require("axios");

const connectionStates = {
  NotConnected: "a",
  Connecting: "b",
  Connected: "c",
};

class Connection {
  constructor(config) {
    this.shouldTransmit = false;
    this.canTransmit = false;
    this.connected = connectionStates.NotConnected;
    this.connectionUrl = config.ConnectionUrl;
    this.connectionPort = config.ConnectionPort;
    this.ConnectionName = config.ConnectionName;
    this.axios = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
    this.Connect();
  }

  Connect() {
    this.connected = connectionStates.Connecting;
    this.axios
      .get(this.connectionUrl + "/pantiltzoom/connections")
      .then((response) => {
        if (!response.data.includes(this.connectionPort)) {
          console.log("Port:" + this.connectionPort + " is not available.");
          console.log("Available Ports:" + response.data);
          process.exit();
        } else {
          var connection = {
            connectionName: this.connectionPort,
            connected: true,
          };
          this.axios
            .put(this.connectionUrl + "/pantiltzoom/connection", connection)
            .then(() => {
              this.canTransmit = true;
              this.connected = connectionStates.Connected;
              this.transmitNextStateIfRequestedAndPossible();
            })
            .catch((error) => {
              console.log("Failed to connect to Port:" + this.connectionPort);
              console.log("error:" + error);
              this.connected = connectionStates.NotConnected;
              process.exit();
            });
        }
      })
      .catch((error) => {
        console.log("Failed to connect:" + this.connectionUrl);
        console.log("error:" + error);
        this.connected = connectionStates.NotConnected;
        process.exit();
      });
  }

  transmitNextStateIfRequestedAndPossible() {
    if (!this.canTransmit) {
      return;
    }
    if (!this.shouldTransmit) {
      return;
    }
    if (this.connected == connectionStates.NotConnected) {
      this.Connect();
      return;
    }
    this.canTransmit = false;
    this.shoudlTransmit = false;
    this.axios
      .put(this.connectionUrl + "/pantiltzoom/state", this.state)
      .then(() => {
        this.canTransmit = true;
        this.transmitNextStateIfRequestedAndPossible();
      })
      .catch((error) => {
        console.log(error);
        this.connected = connectionStates.NotConnected;
        this.Connect();
      });
  }

  setState(state) {
    this.state = state;
    this.shouldTransmit = true;
    this.transmitNextStateIfRequestedAndPossible();
  }

  printConnection() {
    console.log(
      "selected Connection: " +
        this.ConnectionName +
        " (" +
        this.connectionUrl +
        ")"
    );
  }
}

module.exports = { Connection };
