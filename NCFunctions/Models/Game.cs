using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace NCFunctions.Models
{
    public class Game
    {
        [JsonProperty("id")]
        public Guid Id { get; set; }
        [JsonProperty("gamemode")]
        public string GamemodeId { get; set; }
        [JsonProperty("duration")]
        public int? Duration { get; set; }
        [JsonProperty("score")]
        public int Score { get; set; }
    }
}
