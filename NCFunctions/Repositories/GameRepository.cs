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
                    Gamemode = game.Gamemode,
                    Duration = game.Duration,
                    TimeStarted = game.TimeStarted,
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
                    Gamemode = resultEntity.Gamemode,
                    Duration = resultEntity.Duration,
                    TimeStarted = resultEntity.TimeStarted,
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

        public static async Task<List<Game>> GetGamesAsync(bool withUsername, string gamemodeid = null, int? amount = null)
        {
            try
            {
                // Create list to store the result
                List<Game> games = new List<Game>();

                // Get the games table
                CloudTable gameTable = await StorageHelper.GetCloudTable("games");

                // Query to get ALL
                TableQuery<GameEntity> query = new TableQuery<GameEntity>();

                // Filters opslaan
                string usernameFilter = null;
                string gamemodeFilter = null;

                // Query to get ALL with a username filled in (not null)
                if (withUsername)
                    usernameFilter = TableQuery.GenerateFilterCondition("Username", QueryComparisons.NotEqual, null);

                // Query to filter on gamemode id
                if (!string.IsNullOrWhiteSpace(gamemodeid))
                    gamemodeFilter = TableQuery.GenerateFilterCondition("GamemodeId", QueryComparisons.Equal, gamemodeid);

                // Beide filters zijn ingesteld
                if (usernameFilter != null && gamemodeFilter != null)
                    query = query.Where(TableQuery.CombineFilters(usernameFilter, TableOperators.And, gamemodeFilter));
                // Enkel de username (score) filter is ingesteld
                else if (usernameFilter != null && gamemodeFilter == null)
                    query = query.Where(usernameFilter);
                // Enkel de gamemode filter is ingesteld
                else if (gamemodeFilter != null && usernameFilter == null)
                    query = query.Where(gamemodeFilter);

                // Execute the query
                var queryResult = gameTable.ExecuteQuerySegmentedAsync<GameEntity>(query, null);

                foreach (GameEntity ge in queryResult.Result)
                {
                    games.Add(new Game()
                    {
                        Id = ge.Id,
                        GamemodeId = ge.GamemodeId,
                        Gamemode = ge.Gamemode,
                        Duration = ge.Duration,
                        TimeStarted = ge.TimeStarted,
                        Score = ge.Score,
                        Username = ge.Username
                    });
                }

                games.Sort();

                // return a max of (amount) results
                if (amount != null)
                {
                    if (amount > games.Count)
                        amount = games.Count;
                    games = games.GetRange(0, amount.GetValueOrDefault());
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
                    Gamemode = game.Gamemode,
                    Duration = game.Duration,
                    TimeStarted = game.TimeStarted,
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
                    Gamemode = resultEntity.Gamemode,
                    Duration = resultEntity.Duration,
                    TimeStarted = resultEntity.TimeStarted,
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
