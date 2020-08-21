"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraConnection = void 0;
var State_1 = require("../State");
var axios_1 = __importDefault(require("axios"));
var https_1 = __importDefault(require("https"));
var signalr_1 = __importDefault(require("@microsoft/signalr"));
var ConnectionState;
(function (ConnectionState) {
    ConnectionState[ConnectionState["NotConnected"] = 0] = "NotConnected";
    ConnectionState[ConnectionState["Connecting"] = 1] = "Connecting";
    ConnectionState[ConnectionState["Connected"] = 2] = "Connected";
})(ConnectionState || (ConnectionState = {}));
var CameraConnection = (function () {
    function CameraConnection(config) {
        this.shouldTransmit = false;
        this.canTransmit = false;
        this.connectionState = ConnectionState.NotConnected;
        this.currentState = new State_1.State();
        this.config = config;
        this.axios = axios_1.default.create({
            url: config.ConnectionUrl,
            httpsAgent: new https_1.default.Agent({
                rejectUnauthorized: false,
            }),
        });
        this.socketConnection = new signalr_1.default.HubConnectionBuilder()
            .withAutomaticReconnect()
            .withUrl(this.config.ConnectionUrl + "/pantiltzoom/statehub")
            .build();
        this.initialConnect();
    }
    CameraConnection.prototype.initialConnect = function () {
        var _this = this;
        this.setupRemote(function () {
            _this.socketConnection.on("NewState", function (state) {
                console.log("Current state: " + JSON.stringify(state));
            });
            _this.socketConnection.onreconnected(function () {
                _this.setupRemote(function () { return _this.transmitNextStateIfRequestedAndPossible(); });
            });
            _this.socketConnection.onreconnecting;
            _this.socketConnection
                .start()
                .then(function () {
                _this.canTransmit = true;
                _this.connectionState = ConnectionState.Connected;
                _this.transmitNextStateIfRequestedAndPossible();
            })
                .catch(function (error) {
                _this.connectionState = ConnectionState.NotConnected;
                console.log("Socket connection setup failed.");
                console.log("error:" + error);
                _this.initialConnect();
            });
        });
    };
    CameraConnection.prototype.setupRemote = function (onComplete) {
        var _this = this;
        this.connectionState = ConnectionState.Connecting;
        this.axios
            .get("/pantiltzoom/connections")
            .then(function (response) {
            if (!response.data.includes(_this.config.ConnectionPort)) {
                console.log("Port:" + _this.config.ConnectionPort + " is not available.");
                console.log("Available Ports:" + response.data);
                process.exit();
            }
            var connection = {
                connectionName: _this.config.ConnectionPort,
                connected: true,
            };
            _this.axios
                .put("/pantiltzoom/connection", connection)
                .then(function () {
                onComplete();
            })
                .catch(function (error) {
                console.log("Failed to connect to Port:" + _this.config.ConnectionPort);
                console.log("error:" + error);
                process.exit();
            });
        })
            .catch(function (error) {
            console.log("Failed to connect:" + _this.config.ConnectionUrl);
            console.log("error:" + error);
            _this.connectionState = ConnectionState.NotConnected;
            _this.setupRemote(onComplete);
        });
    };
    CameraConnection.prototype.transmitNextStateIfRequestedAndPossible = function () {
        var _this = this;
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
            .then(function (updateSuccessful) {
            _this.canTransmit = true;
            if (!updateSuccessful) {
                console.log("state update failure returned - retrying");
                _this.shouldTransmit = true;
                _this.transmitNextStateIfRequestedAndPossible();
            }
        })
            .catch(function (error) {
            _this.shouldTransmit = true;
            console.log("state transmission error:");
            console.log("error:" + error);
        });
    };
    CameraConnection.prototype.setState = function (state) {
        this.currentState = state;
        this.shouldTransmit = true;
        this.transmitNextStateIfRequestedAndPossible();
    };
    CameraConnection.prototype.printConnection = function () {
        console.log("selected Connection: " +
            this.config.ConnectionName +
            " (" +
            this.config.ConnectionUrl +
            ")");
    };
    return CameraConnection;
}());
exports.CameraConnection = CameraConnection;
