using CGF.CameraControl.Provider.Models;
using CGF.CameraControl.Provider.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace CGF.CameraControl.Provider.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PanTiltZoomController : ControllerBase
    {
        private readonly IHardwareCommunicator _communicator;
        public PanTiltZoomController(IHardwareCommunicator communicator)
        {
            _communicator = communicator;
        }

        [HttpGet]
        [Route("state")]
        public State GetState() => _communicator.State;

        [HttpPut]
        [Route("state")]
        public IActionResult SetCurrentState(State state)
        {
            _communicator.State = state;
            Console.WriteLine($"{state}\t{state.ToArduinoString(1)}");
            return NoContent();
        }


        [HttpGet]
        [Route("connections")]
        public IEnumerable<string> GetAvailableConnections() => _communicator.AvailableConnections;

        [HttpGet]
        [Route("connection")]
        public CurrentConnection GetCurrentConnection() => _communicator.CurrentConnection;

        [HttpPut]
        [Route("connection")]
        public IActionResult SetCurrentConnection(CurrentConnection connection)
        {
            try
            {
                _communicator.CurrentConnection = connection;
                return NoContent();
            }
            catch (Exception)
            {
                return BadRequest();
            }
        }
    }
}
