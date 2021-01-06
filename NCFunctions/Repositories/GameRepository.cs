using NCFunctions.Helpers;
using NCFunctions.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace NCFunctions.Repositories
{
    public class GameRepository
    {
        public static async Task<Game> GetCurrentGameAsync()
        {
            Game CurrentGame = await IoTHubHelper.CurrentGameMethod();
            return CurrentGame;
        }
    }
}
