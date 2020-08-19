using CGF.CameraControl.Provider.Models;
using CGF.CameraControl.Provider.Services;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace CGF.CameraControl.Provider.Hubs
{
    public class StateHub : Hub
    {
        private readonly IHardwareCommunicator _hardwareCommunicator;

        public StateHub(IHardwareCommunicator hardwareCommunicator)
        {
            _hardwareCommunicator = hardwareCommunicator;
        }

        public async Task SetState(State state)
        {
            _hardwareCommunicator.State = state;
            await Clients.All.SendAsync("NewState", state);
        }
    }
}