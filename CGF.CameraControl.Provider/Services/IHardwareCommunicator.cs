using CGF.CameraControl.Provider.Models;
using System.IO;
using System.Threading.Tasks;

namespace CGF.CameraControl.Provider.Services
{
    public interface IHardwareCommunicator
    {
        State State { get; set; }
        string[] AvailableConnections { get; }
        CurrentConnection CurrentConnection { get; set; }
        Task<bool> UploadFirmware(Stream firmwareFile);
    }
}
