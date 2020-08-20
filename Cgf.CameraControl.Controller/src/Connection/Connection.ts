import { State } from "../State";
import axios, { AxiosInstance } from "axios";
import https from "https";
import signalR from "@microsoft/signalr";
import { ConnectionConfig } from "./ConnectionConfig";

enum ConnectionState {
  NotConnected,
  Connecting,
  Connected,
}

export class Connection {
  private shouldTransmit: boolean = false;
  private canTransmit: boolean = false;
  private connectionState: ConnectionState = ConnectionState.NotConnected;
  private readonly config: ConnectionConfig;
  private readonly axios: AxiosInstance;
  private socketConnection: signalR.HubConnection;
  private currentState: State = new State();

  constructor(config: ConnectionConfig) {
    this.config = config;
    this.axios = axios.create({
      url: config.ConnectionUrl,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });

    this.socketConnection = new signalR.HubConnectionBuilder()
      .withAutomaticReconnect()
      .withUrl(this.config.ConnectionUrl + "/pantiltzoom/statehub")
      .build();

    this.initialConnect();
  }

  private initialConnect() {
    this.setupRemote(() => {
      this.socketConnection.on("NewState", (state: State) => {
        console.log("Current state: " + JSON.stringify(state));
      });
      this.socketConnection.onreconnected(() => {
        this.setupRemote(() => this.transmitNextStateIfRequestedAndPossible());
      });
      this.socketConnection.onreconnecting;
      this.socketConnection
        .start()
        .then(() => {
          this.canTransmit = true;
          this.connectionState = ConnectionState.Connected;
          this.transmitNextStateIfRequestedAndPossible();
        })
        .catch((error) => {
          this.connectionState = ConnectionState.NotConnected;
          console.log("Socket connection setup failed.");
          console.log("error:" + error);
          this.initialConnect();
        });
    });
  }

  private setupRemote(onComplete: () => void) {
    this.connectionState = ConnectionState.Connecting;
    this.axios
      .get("/pantiltzoom/connections")
      .then((response) => {
        if (!response.data.includes(this.config.ConnectionPort)) {
          console.log(
            "Port:" + this.config.ConnectionPort + " is not available."
          );
          console.log("Available Ports:" + response.data);
          process.exit();
        }
        var connection = {
          connectionName: this.config.ConnectionPort,
          connected: true,
        };
        this.axios
          .put("/pantiltzoom/connection", connection)
          .then(() => {
            onComplete();
          })
          .catch((error) => {
            console.log(
              "Failed to connect to Port:" + this.config.ConnectionPort
            );
            console.log("error:" + error);
            process.exit();
          });
      })
      .catch((error) => {
        console.log("Failed to connect:" + this.config.ConnectionUrl);
        console.log("error:" + error);
        this.connectionState = ConnectionState.NotConnected;
        this.setupRemote(onComplete);
      });
  }

  private transmitNextStateIfRequestedAndPossible() {
    if (!this.canTransmit) {
      return;
    }
    if (!this.shouldTransmit) {
      return;
    }
    if (this.connectionState != ConnectionState.Connected) {
      return;
    }
    this.canTransmit = false;
    this.shouldTransmit = false;
    this.socketConnection
      .invoke("SetState", this.currentState)
      .then((updateSuccessful: boolean) => {
        this.canTransmit = true;
        if (!updateSuccessful) {
          console.log("state update failure returned - retrying");
          this.shouldTransmit = true;
          this.transmitNextStateIfRequestedAndPossible();
        }
      })
      .catch((error) => {
        this.shouldTransmit = true;
        console.log("state transmission error:");
        console.log("error:" + error);
      });
  }

  setState(state: State) {
    this.currentState = state;
    this.shouldTransmit = true;
    this.transmitNextStateIfRequestedAndPossible();
  }

  printConnection() {
    console.log(
      "selected Connection: " +
        this.config.ConnectionName +
        " (" +
        this.config.ConnectionUrl +
        ")"
    );
  }
}
