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
    public static class GamemodeRepository
    {
        public static async Task<List<Gamemode>> GetGamemodesAsync(bool released) {
            // Create list to store the result
            List<Gamemode> gamemodes = new List<Gamemode>();

            // Get the gamemodes table
            CloudTable gamemodeTable = await StorageHelper.GetCloudTable("gamemodes");

            // Query to get ALL
            TableQuery<GamemodeEntity> query = new TableQuery<GamemodeEntity>();

            if (released)
                query.Where(TableQuery.GenerateFilterCondition("released", QueryComparisons.Equal, true.ToString()));

            var queryResult = gamemodeTable.ExecuteQuerySegmentedAsync<GamemodeEntity>(query, null);

            foreach (GamemodeEntity gme in queryResult.Result)
            {
                gamemodes.Add(new Gamemode()
                {
                    Id = gme.Id,
                    Name = gme.Name,
                    Description = gme.Description,
                    Duration = gme.Duration,
                    Released = gme.Released
                });
            }

            return gamemodes;
        }

        public static async Task<Gamemode> AddGamemodeAsync(Gamemode gm)
        {
            try
            {
                // Make Entity of it
                GamemodeEntity gamemodeEntity = new GamemodeEntity(gm.Id, gm.Name, gm.Description, gm.Duration, gm.Released);

                CloudTable gamemodeTable = await StorageHelper.GetCloudTable("gamemodes");

                TableOperation insertOperation = TableOperation.Insert(gamemodeEntity);

                TableResult result = await gamemodeTable.ExecuteAsync(insertOperation);

                GamemodeEntity resultEntity = result.Result as GamemodeEntity;
                Gamemode resultGamemode = new Gamemode()
                {
                    Id = resultEntity.Id,
                    Name = resultEntity.Name,
                    Description = resultEntity.Description,
                    Duration = resultEntity.Duration,
                    Released = resultEntity.Released
                };

                return resultGamemode;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            
        }
    }
}
