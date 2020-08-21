"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
var logitechF310_1 = require("./logitechF310");
var CameraConnection_1 = require("../CameraConnection/CameraConnection");
var State_1 = require("../State");
var GameController = (function () {
    function GameController(config) {
        var _this = this;
        this.cameraConnections = [];
        this.currentConnection = 0;
        this.state = new State_1.State();
        switch (config.ControllerType) {
            case "logitech/gamepadf310":
                new logitechF310_1.logitechF310(this.onPan, this.onTilt, this.onZoom, this.onFocus, this.onNext, this.onPrevious);
                break;
            default:
                console.log(config.ControllerType + " not yet supported");
                process.exit();
        }
        config.CameraConnections.forEach(function (c) {
            _this.cameraConnections.push(new CameraConnection_1.CameraConnection(c));
        });
    }
    GameController.prototype.onPan = function (pan) {
        this.state.pan = pan;
        this.cameraConnections[this.currentConnection].setState(this.state);
    };
    GameController.prototype.onTilt = function (tilt) {
        this.state.tilt = tilt;
        this.cameraConnections[this.currentConnection].setState(this.state);
    };
    GameController.prototype.onZoom = function (zoom) {
        this.state.zoom = zoom;
        this.cameraConnections[this.currentConnection].setState(this.state);
    };
    GameController.prototype.onFocus = function (focus) {
        this.state.focus = focus;
        this.cameraConnections[this.currentConnection].setState(this.state);
    };
    GameController.prototype.onNext = function () {
        this.changeConnection(this.currentConnection + 1);
    };
    GameController.prototype.onPrevious = function () {
        this.changeConnection(this.currentConnection - 1);
    };
    GameController.prototype.changeConnection = function (nextConnection) {
        nextConnection = this.mod(nextConnection, this.cameraConnections.length);
        if (this.currentConnection != nextConnection) {
            this.cameraConnections[this.currentConnection].setState(new State_1.State());
            this.currentConnection = nextConnection;
            this.cameraConnections[this.currentConnection].setState(this.state);
            this.cameraConnections[this.currentConnection].printConnection();
        }
    };
    GameController.prototype.mod = function (n, m) {
        return ((n % m) + m) % m;
    };
    return GameController;
}());
exports.GameController = GameController;
