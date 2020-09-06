import { State } from "../State";
import axios, { AxiosInstance } from "axios";
import https from "https";
import * as signalR from "@microsoft/signalr";
import { CameraConnectionConfig } from "./CameraConnectionConfig";

export class CameraConnection {
  private shouldTransmitState: boolean = false;
  private shouldTransmitAutofocusToggle: boolean = false;
  private canTransmit: boolean = false;
  private connected= false;
  private readonly config: CameraConnectionConfig;
  private readonly axios: AxiosInstance;
  private socketConnection: signalR.HubConnection;
  private currentState: State = new State();

  constructor(config: CameraConnectionConfig) {
    this.config = config;
    this.axios = axios.create({
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
      /*this.socketConnection.on("NewState", (state: State) => {
        console.log("Current state: " + JSON.stringify(state));
      });*/
      this.socketConnection.onreconnected(() => {
        console.log(`reconnect successful (${this.config.ConnectionUrl})`);
        this.setupRemote(() => {
          this.connectionSuccessfullyEstablished();
        });
      });
      this.socketConnection.onreconnecting(() => {
        console.log(
          `connection error (${this.config.ConnectionUrl}) - trying automatic reconnect`
        );
        this.connected = false;
      });
      this.socketConnection
        .start()
        .then(() => {
          this.connectionSuccessfullyEstablished();
        })
        .catch((error) => {
          console.log("Socket connection setup failed.");
          console.log("error:" + error);
          this.initialConnect();
        });
    });
  }

  private connectionSuccessfullyEstablished() {
    this.canTransmit = true;
    this.connected = true;
    this.transmitNextStateIfRequestedAndPossible();
  }

  private setupRemote(onComplete: () => void) {
    this.axios
      .get(this.config.ConnectionUrl + "/pantiltzoom/connections")
      .then((response) => {
        if (!response.data.includes(this.config.ConnectionPort)) {
          console.log(
            "Port:" + this.config.ConnectionPort + " is not available."
          );
          console.log("Available Ports:" + response.data);
          process.exit();
        }
        let connection = {
          connectionName: this.config.ConnectionPort,
          connected: true,
        };
        this.axios
          .put(
            this.config.ConnectionUrl + "/pantiltzoom/connection",
            connection
          )
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
        this.setupRemote(onComplete);
      });
  }

  private transmitNextStateIfRequestedAndPossible() {
    if (!this.canTransmit) {
      return;
    }
    if (!this.connected) {
      return;
    }
    if (this.shouldTransmitState) {
      this.canTransmit = false;
      this.shouldTransmitState = false;
      this.socketConnection
        .invoke("SetState", this.currentState)
        .then((updateSuccessful: boolean) => {
          if (!updateSuccessful) {
            console.log("state update failure returned - retrying");
            this.shouldTransmitState = true;
          }
          this.canTransmit = true;
          this.transmitNextStateIfRequestedAndPossible();
        })
        .catch((error) => {
          this.shouldTransmitState = true;
          console.log("state transmission error:");
          console.log("error:" + error);
        });
    }
  }

  setState(state: State) {
    this.currentState = state;
    this.shouldTransmitState = true;
    this.transmitNextStateIfRequestedAndPossible();
  }

  toggleAutofocus() {
    this.shouldTransmitAutofocusToggle = true;
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
