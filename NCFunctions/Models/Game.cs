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
        [JsonProperty("gamemode_id")]
        public string GamemodeId { get; set; }
        [JsonProperty("gamemode")]
        public string Gamemode { get; set; }
        [JsonProperty("duration")]
        public int? Duration { get; set; }
        [JsonProperty("timestarted")]
        public DateTime TimeStarted { get; set; }
        [JsonProperty("score")]
        public int Score { get; set; } = 0;
        [JsonProperty("username")]
        public string Username { get; set; } = null;
    }
}
