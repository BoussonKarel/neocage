using NCFunctions.Models;
using NCFunctions.Repositories;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace NCFunctions.Helpers
{
    public static class GameHelper
    {
        public static async Task StartGame(Gamemode gamemode)
        {
            try
            {
                // Haal de huidige game op
                Game CurrentGame = await GameRepository.GetCurrentGameAsync();

                // Is er al een game?
                if (CurrentGame == null)
                {
                    // Er is nog geen game bezig, game aanmaken
                    CurrentGame = new Game()
                    {
                        Id = Guid.NewGuid(),
                        GamemodeId = gamemode.Id,
                        Duration = gamemode.Duration,
                        Score = 0
                    };

                    // Game details naar device sturen in start methode
                    await IoTHubHelper.StartGameMethod(CurrentGame);
                }
                else
                {
                    // Er is al een game bezig
                    throw new ApplicationException("GAME_BUSY");
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public static async Task StopGame()
        {
            try
            {
                Game CurrentGame = await GameRepository.GetCurrentGameAsync();

                if (CurrentGame == null)
                {
                    // Er is geen game bezig
                    throw new ApplicationException("NO_GAME");
                }
                else
                {
                    // Er is al een game bezig, stuur stop methode
                    await IoTHubHelper.StopGameMethod();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public static async Task GameUpdate(Game game)
        {
            // Received a game update, send it to the end user
            Console.WriteLine(game);
            // -- send game details over MQTT
        }
    }
}
