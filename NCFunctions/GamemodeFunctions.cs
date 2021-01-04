using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using NCFunctions.Models;
using NCFunctions.Repositories;
using System.Collections.Generic;

namespace NCFunctions
{
    public static class GamemodeFunctions
    {
        [FunctionName("AddGamemode")]
        public static async Task<IActionResult> AddGamemode(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "gamemodes")] HttpRequest req,
            ILogger log)
        {
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            Gamemode gamemode = JsonConvert.DeserializeObject<Gamemode>(requestBody);

            Gamemode added = await GamemodeRepository.AddGamemodeAsync(gamemode);

            return new OkObjectResult(added);
        }

        [FunctionName("GetReleasedGamemodes")]
        public static async Task<IActionResult> GetReleasedGamemodes(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "gamemodes")] HttpRequest req,
            ILogger log)
        {
            List<Gamemode> gamemodes = await GamemodeRepository.GetGamemodesAsync(true);

            return new OkObjectResult(gamemodes);
        }

        [FunctionName("GetAllGamemodes")]
        public static async Task<IActionResult> GetAllGamemodes(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "gamemodes/all")] HttpRequest req,
            ILogger log)
        {
            List<Gamemode> gamemodes = await GamemodeRepository.GetGamemodesAsync(false);

            return new OkObjectResult(gamemodes);
        }
    }
}
