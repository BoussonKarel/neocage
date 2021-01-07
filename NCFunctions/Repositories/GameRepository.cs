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
            try
            {
                Game CurrentGame = await IoTHubHelper.CurrentGameMethod();
                return CurrentGame;
            }
            catch (Exception ex)
            {

                throw ex;
            }
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

                CloudTable gameTable = await StorageHelper.GetCloudTable("games");

                TableOperation insertOperation = TableOperation.Insert(gameEntity);

                TableResult result = await gameTable.ExecuteAsync(insertOperation);

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

        public static async Task<List<Game>> GetGamesAsync(bool withUsername)
        {
            try
            {
                // Create list to store the result
                List<Game> games = new List<Game>();

                // Get the games table
                CloudTable gameTable = await StorageHelper.GetCloudTable("games");

                // Query to get ALL
                TableQuery<GameEntity> query = new TableQuery<GameEntity>();

                // Query to get ALL with a username filled in (not null)
                if (withUsername)
                    query = query.Where(TableQuery.GenerateFilterCondition("Username", QueryComparisons.NotEqual, null));

                var queryResult = gameTable.ExecuteQuerySegmentedAsync<GameEntity>(query, null);

                foreach (GameEntity ge in queryResult.Result)
                {
                    games.Add(new Game()
                    {
                        Id = ge.Id,
                        GamemodeId = ge.GamemodeId,
                        Duration = ge.Duration,
                        Score = ge.Score,
                        Username = ge.Username
                    });
                }

                return games;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public static async Task<Game> UpdateGameAsync(Game game)
        {
            try
            {
                // Make Entity of it
                GameEntity gameEntity = new GameEntity(game.Id, game.GamemodeId)
                {
                    Duration = game.Duration,
                    Score = game.Score,
                    Username = game.Username
                };

                CloudTable gameTable = await StorageHelper.GetCloudTable("games");

                gameEntity.ETag = "*";
                TableOperation updateOperation = TableOperation.Replace(gameEntity);

                TableResult result = await gameTable.ExecuteAsync(updateOperation);

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
