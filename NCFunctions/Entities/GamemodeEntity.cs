using Microsoft.Azure.Cosmos.Table;
using System;
using System.Collections.Generic;
using System.Text;

namespace NCFunctions.Entities
{
    public class GamemodeEntity : TableEntity
    {
        public GamemodeEntity()
        {

        }

        public GamemodeEntity(string id, string name, string desc, int dur, bool rel)
        {
            Id = id;
            Name = name;
            Description = desc;
            Duration = dur;
            Released = rel;
            RowKey = Id;
            PartitionKey = Released.ToString();
        }

        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int Duration { get; set; }
        public bool Released { get; set; }
    }
}
