using CGF.CameraControl.Provider.Controllers;
using CGF.CameraControl.Provider.Models;
using System;
using System.Collections.Generic;
using System.IO.Ports;
using System.Linq;

namespace CGF.CameraControl.Provider.Services
{
    public class HardwareCommunicator : IHardwareCommunicator, IDisposable
    {
        SerialPort _communicationPort;
        string _receptionData = "";

        public HardwareCommunicator()
        {
            State = new State();
            _communicationPort = new SerialPort();

            _communicationPort.BaudRate = 500000;
            _communicationPort.DataReceived += SerialDataReceived;
            if (SerialPort.GetPortNames().Length == 1)
            {
                try
                {
                    StartSerialCommunication(SerialPort.GetPortNames().FirstOrDefault());
                }
                catch (Exception)
                {
                    // we don't want the constructor to throw
                }
            }
        }

        private void SerialDataReceived(object sender, SerialDataReceivedEventArgs e)
        {
            var port = (SerialPort)sender;
            IEnumerable<string> received;
            lock (this)
            {
                _receptionData += port.ReadExisting();
                var allReceived = _receptionData.Split('\n');
                _receptionData = allReceived.Last();
                received = allReceived.Take(allReceived.Length - 1);
            }
            foreach (var element in received)
            {
                switch (element.Trim())
                {
                    case "next":
                        port.Write($"@{State}\n");
                        break;
                    default:
                        break;
                }
            }
        }

        public State State { get; set; }

        public string[] AvailableConnections => SerialPort.GetPortNames();

        public CurrentConnection CurrentConnection
        {
            get => new CurrentConnection
            {
                ConnectionName = _communicationPort.PortName,
                Connected = _communicationPort.IsOpen
            };
            set
            {
                if (value.Connected)
                {
                    StartSerialCommunication(value.ConnectionName);
                }
            }
        }

        private void StartSerialCommunication(string portname)
        {
            if (_communicationPort.IsOpen)
            {
                _communicationPort.Close();
            }
            _communicationPort.PortName = portname;
            _communicationPort.Open();
        }

        public void Dispose() => _communicationPort.Dispose();
    }
}
