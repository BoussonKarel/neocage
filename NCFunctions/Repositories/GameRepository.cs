using Microsoft.Azure.Cosmos.Table;
using NCFunctions.Entities;
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

        public static async Task<Game> SaveGameAsync(Game game)
        {
            try
            {
                // Make Entity of it
                GameEntity gameEntity = new GameEntity(game.Id, game.GamemodeId) {
                    Duration = game.Duration,
                    Score = game.Score,
                    Username = game.Username
                };

                CloudTable gamemodeTable = await StorageHelper.GetCloudTable("games");

                TableOperation insertOperation = TableOperation.Insert(gameEntity);

                TableResult result = await gamemodeTable.ExecuteAsync(insertOperation);

                GameEntity resultEntity = result.Result as GameEntity;
                Game resultGame = new Game()
                {
                    Id = resultEntity.Id,
                    GamemodeId = resultEntity.GamemodeId,
                    Duration = resultEntity.Duration,
                    Score = resultEntity.Score,
                    Username = resultEntity.Username
                };

                return resultGame;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
