using Microsoft.Azure.Cosmos.Table;
using System;
using System.Collections.Generic;
using System.Text;

namespace NCFunctions.Entities
{
    public class GameEntity : TableEntity
    {
        public GameEntity()
        {

        }

        public GameEntity(Guid id, string gamemodeid)
        {
            Id = id;
            GamemodeId = gamemodeid;
            RowKey = id.ToString();
            PartitionKey = gamemodeid;
        }

        public Guid Id { get; set; }
        public string GamemodeId { get; set; }
        public string Gamemode { get; set; }
        public int Duration { get; set; }
        public DateTime TimeStarted { get; set; }
        public int Score { get; set; } = 0;
        public string Username { get; set; } = null;
    }
}
