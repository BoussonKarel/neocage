using NCFunctions.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NCFunctions.Helpers
{
    public static class GameHelper
    {
        public static Game CurrentGame { get; set; } = null;
        public static void StartGame(Gamemode gamemode)
        {
            try
            {
                if (CurrentGame.Equals(null))
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
                    
                }
                else
                {
                    // Er is al een game bezig
                    throw new ApplicationException("Er is al een game bezig");
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
