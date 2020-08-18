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
    this.shoudlTransmit = false;
    this.canTransmit = false;
    this.connected = connectionStates.NotConnected;
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
    this.connected = connectionStates.Connecting;
    this.axios
      .get(this.connectionUrl + "/pantiltzoom/connections")
      .then((response) => {
        if (!response.data.includes(this.connectionPort)) {
          console.log("Port:" + this.connectionPort + " is not available.");
          console.log("Available Ports:" + response.data);
          this.connected = connectionStates.NotConnected;
        } else {
          var connection = {
            connectionName: this.connectionPort,
            connected: true,
          };
          this.axios
            .put(this.connectionUrl + "/pantiltzoom/connection", connection)
            .then(() => {
              this.connection = new signalR.HubConnectionBuilder()
                .configureLogging(signalR.LogLevel.Debug)
                .withUrl(this.connectionUrl + "/pantiltzoom/statehub")
                .build();

              this.connection.on("NewState", (state) => {
                this.canTransmit = true;
                console.log("Current state: " + JSON.stringify(state));
              });
              this.connection
                .start()
                .then(() => {
                  this.canTransmit = true;
                  this.connected = connectionStates.Connected;
                  this.transmitNextStateIfRequestedAndPossible();
                })
                .catch((error) => {
                  console.log("Socket connection setup failed.");
                  console.log("error:" + error);
                });
            })
            .catch((error) => {
              console.log("Failed to connect to Port:" + this.connectionPort);
              console.log("error:" + error);
              this.connected = connectionStates.NotConnected;
            });
        }
      })
      .catch((error) => {
        console.log("Failed to connect:" + this.connectionUrl);
        console.log("error:" + error);
        this.connected = connectionStates.NotConnected;
      });
  }

  transmitNextStateIfRequestedAndPossible() {
    if (!this.canTransmit) {
      return;
    }
    if (!this.shoudlTransmit) {
      return;
    }
    if (this.connected == connectionStates.NotConnected) {
      this.Connect();
    }
    this.canTransmit = false;
    this.shoudlTransmit = false;
    this.connection.invoke("SetState", this.state);
  }

  setState(state) {
    this.state = state;
    this.shoudlTransmit = true;
    this.transmitNextStateIfRequestedAndPossible();
  }
}

module.exports = { Connection };
