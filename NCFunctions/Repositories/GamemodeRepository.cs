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
        public static async Task<List<Gamemode>> GetGamemodesAsync() {
            List<Gamemode> gamemodes = new List<Gamemode>();

            return gamemodes;
        }

        public static async Task<Gamemode> AddGamemodeAsync(Gamemode gm)
        {
            try
            {
                // Make Entity of it
                GamemodeEntity gamemodeEntity = new GamemodeEntity(gm.Id, gm.Description, gm.Duration, gm.Released);

                CloudTable gamemodeTable = await StorageHelper.GetCloudTable("gamemodes");

                TableOperation insertOperation = TableOperation.Insert(gamemodeEntity);

                await gamemodeTable.ExecuteAsync(insertOperation);

                return gm;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            
        }
    }
}
