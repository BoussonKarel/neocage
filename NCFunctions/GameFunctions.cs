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
using NCFunctions.Repositories;
using System.Collections.Generic;

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
                Game startedGame = await GameHelper.StartGame(selectedGamemode);

                return new OkObjectResult(startedGame);
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

        [FunctionName("GetCurrentGame")]
        public static async Task<IActionResult> GetCurrentGame(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "games/current")] HttpRequest req,
            ILogger log)
        {
            try
            {
                // User wants to get details about the current game
                Game CurrentGame = await GameRepository.GetCurrentGameAsync();

                if (CurrentGame == null)
                {
                    return new OkObjectResult(new NoContent());
                }

                return new OkObjectResult(CurrentGame);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [FunctionName("GetGames")]
        public static async Task<IActionResult> GetGames(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "games")] HttpRequest req,
            ILogger log)
        {
            try
            {
                // User wants to get the played games with a username filled in (score saved)
                // No matter what gamemode
                List<Game> gamesWithScore = await GameRepository.GetGamesAsync(true);

                return new OkObjectResult(gamesWithScore);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [FunctionName("GetAllGames")]
        public static async Task<IActionResult> GetAllGames(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "games/all")] HttpRequest req,
            ILogger log)
        {
            try
            {
                // User wants to get ALL the played games
                // No matter what gamemode
                List<Game> games = await GameRepository.GetGamesAsync(false);

                return new OkObjectResult(games);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [FunctionName("GetGamesByGamemode")]
        public static async Task<IActionResult> GetGamesByGamemode(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "games/{gamemodeid}")] HttpRequest req,
            string gamemodeid,
            ILogger log)
        {
            try
            {
                // User wants to get the played games with a username filled in (score saved)
                // Only the ones of gamemode id
                List<Game> gamesWithScore = await GameRepository.GetGamesAsync(true, gamemodeid);

                return new OkObjectResult(gamesWithScore);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [FunctionName("GetAllGamesByGamemode")]
        public static async Task<IActionResult> GetAllGamesByGamemode(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "games/{gamemodeid}/all")] HttpRequest req,
            string gamemodeid,
            ILogger log)
        {
            try
            {
                // User wants to get ALL the played games
                // Only the ones of gamemode id
                List<Game> gamesWithScore = await GameRepository.GetGamesAsync(false, gamemodeid);

                return new OkObjectResult(gamesWithScore);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [FunctionName("UpdateUsernameForGame")]
        public static async Task<IActionResult> UpdateUsernameForGame(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "games")] HttpRequest req,
            ILogger log)
        {
            try
            {
                // User wants to add his username to his score
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Game selectedGame = JsonConvert.DeserializeObject<Game>(requestBody);

                // User wants to get all the games
                Game game = await GameRepository.UpdateGameAsync(selectedGame);

                return new OkObjectResult(game);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
