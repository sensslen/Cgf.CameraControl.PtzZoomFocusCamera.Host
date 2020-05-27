using CGF.CameraControl.Provider.Controllers;
using CGF.CameraControl.Provider.Models;

namespace CGF.CameraControl.Provider.Services
{
    public interface IHardwareCommunicator
    {
        public State State { get; set; }
        public string[] AvailableConnections { get; }
        public CurrentConnection CurrentConnection { get; set; }
    }
}
