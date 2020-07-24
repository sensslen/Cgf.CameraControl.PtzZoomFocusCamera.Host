using CGF.CameraControl.Provider.Models;
using CGF.CameraControl.Provider.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

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
            if (!_communicator.CurrentConnection.Connected)
            {
                return BadRequest();
            }
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

        [HttpPost]
        [Route("firmware")]
        public async Task<IActionResult> OnPostUploadAsync(IFormFile file)
        {
            long size = file.Length;

            foreach (var formFile in files)
            {
                if (formFile.Length > 0)
                {
                    var filePath = Path.GetTempFileName();

                    using (var stream = System.IO.File.Create(filePath))
                    {
                        await formFile.CopyToAsync(stream);
                    }
                }
            }

            // Process uploaded files
            // Don't rely on or trust the FileName property without validation.

            return Ok(new { count = files.Count, size });
        }
    }
}
