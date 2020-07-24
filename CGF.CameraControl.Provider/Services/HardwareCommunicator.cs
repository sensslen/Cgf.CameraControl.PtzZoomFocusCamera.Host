using CGF.CameraControl.Provider.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Ports;
using System.Linq;
using System.Threading.Tasks;

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
                    case "v1":
                        port.Write($"?{State.ToArduinoString(1)}\n");
                        break;
                    default:
                        Console.WriteLine(element);
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

        private void StartSerialCommunication(string portname = null)
        {
            CloseConnection();
            if (portname != null)
            {
                _communicationPort.PortName = portname;
            }
            _communicationPort.Open();
        }

        private void CloseConnection()
        {
            if (_communicationPort.IsOpen)
            {
                _communicationPort.Close();
            }
        }

        public void Dispose() => _communicationPort.Dispose();

        public Task<bool> UploadFirmware(Stream firmwareFile)
        {
            CloseConnection();
            return Task.Run(() => FirmwareUploader.DoUpload(firmwareFile, _communicationPort.PortName)).ContinueWith((previousTask) => { StartSerialCommunication(); return previousTask.Result; });
        }
    }
}
