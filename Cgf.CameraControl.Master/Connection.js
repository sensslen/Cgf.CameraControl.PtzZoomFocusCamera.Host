const https = require("https");
const axios = require("axios");
const signalR = require("@microsoft/signalr");

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
    this.setupConnection(() => {
      this.connection = new signalR.HubConnectionBuilder()
        .withAutomaticReconnect()
        .withUrl(this.connectionUrl + "/pantiltzoom/statehub")
        .build();

      this.connection.on("NewState", (state) => {
        console.log("Current state: " + JSON.stringify(state));
      });
      this.connection.onreconnected(() => {
        this.setupConnection(() =>
          this.transmitNextStateIfRequestedAndPossible()
        );
      });
      this.connection
        .start()
        .then(() => {
          this.canTransmit = true;
          this.connected = connectionStates.Connected;
          this.transmitNextStateIfRequestedAndPossible();
        })
        .catch((error) => {
          this.connection = connectionStates.NotConnected;
          console.log("Socket connection setup failed.");
          console.log("error:" + error);
          this.Connect();
        });
    });
  }

  setupConnection(callback) {
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
              callback();
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
        this.setupConnection(callback);
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
    this.shouldTransmit = false;
    this.connection
      .invoke("SetState", this.state)
      .then(() => (this.canTransmit = true))
      .catch((error) => {
        this.shouldTransmit = true;
        console.log("state transmission error:");
        console.log("error:" + error);
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
