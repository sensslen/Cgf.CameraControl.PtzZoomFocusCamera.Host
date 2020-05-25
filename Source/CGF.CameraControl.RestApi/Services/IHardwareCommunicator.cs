using CGF.CameraControl.RestApi.Controllers;
using CGF.CameraControl.RestApi.Models;

namespace CGF.CameraControl.RestApi.Services
{
    public interface IHardwareCommunicator
    {
        public State State { get; set; }
        public string[] AvailableConnections { get; }
        public CurrentConnection CurrentConnection { get; set; }
    }
}
