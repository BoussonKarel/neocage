using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace NCFunctions.Models
{
    public class Gamemode
    {
        [JsonProperty("id")]
        public string Id { get; set; }
        [JsonProperty("name")]
        public string Name { get; set; }
        [JsonProperty("description")]
        public string Description { get; set; }
        [JsonProperty("duration")]
        public int Duration { get; set; }
        [JsonProperty("released")]
        public bool Released { get; set; }
    }
}
