using NCFunctions.Models;
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
                Game CurrentGame = await IoTHubHelper.CurrentGameMethod();

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

                    // Send these game details to the ESP32
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
                Game CurrentGame = await IoTHubHelper.CurrentGameMethod();

                if (CurrentGame == null)
                {
                    // Er is geen game bezig
                    throw new ApplicationException("NO_GAME");
                }
                else
                {
                    // Er is geen game bezig
                    await IoTHubHelper.StopGameMethod();
                    CurrentGame = null;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
