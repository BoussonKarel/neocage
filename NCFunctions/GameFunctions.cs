using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace NCFunctions
{
    public static class GameFunctions
    {
        [FunctionName("StartGame")]
        public static async Task<IActionResult> StartGame(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "game/start")] HttpRequest req,
            ILogger log)
        {
            // User wants to start the game

            return new OkObjectResult("");
        }
    }
}
