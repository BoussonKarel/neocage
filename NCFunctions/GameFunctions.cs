using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using NCFunctions.Helpers;
using NCFunctions.Models;

namespace NCFunctions
{
    public static class GameFunctions
    {
        [FunctionName("StartGame")]
        public static async Task<IActionResult> StartGame(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "game/start")] HttpRequest req,
            ILogger log)
        {
            try
            {
                // User wants to start the game
                // Which gamemode did he choose?
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Gamemode selectedGamemode = JsonConvert.DeserializeObject<Gamemode>(requestBody);

                // Start this gamemode
                await GameHelper.StartGame(selectedGamemode);

                return new OkObjectResult("");
            }
            catch (Exception ex)
            {
                if (ex.Message.Equals("GAME_BUSY"))
                {
                    return new BadRequestObjectResult("There is already a game.");
                }
                throw ex;
            }
        }

        [FunctionName("StopGame")]
        public static async Task<IActionResult> StopGame(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "game/stop")] HttpRequest req,
            ILogger log)
        {
            try
            {
                // Stop the game
                await GameHelper.StopGame();

                return new OkObjectResult("");
            }
            catch (Exception ex)
            {
                if (ex.Message.Equals("NO_GAME"))
                {
                    return new BadRequestObjectResult("There is no game to stop.");
                }
                throw ex;
            }
        }
    }
}
