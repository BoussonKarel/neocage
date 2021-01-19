using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace NCFunctions.Models
{
    public class Game : IComparable
    {
        [JsonProperty("id")]
        public Guid Id { get; set; }
        [JsonProperty("gamemode_id")]
        public string GamemodeId { get; set; }
        [JsonProperty("gamemode")]
        public string Gamemode { get; set; }
        [JsonProperty("duration")]
        public int Duration { get; set; }
        [JsonProperty("timestarted")]
        public DateTime TimeStarted { get; set; }
        [JsonProperty("score")]
        public int Score { get; set; } = 0;
        [JsonProperty("username")]
        public string Username { get; set; } = null;

        public int CompareTo(object obj)
        {
            // Eerst controleren ofdat dit object niet null is
            if (obj == null)
                return 1;
            // Converteren naar Collectible
            Game game = obj as Game;
            if (game != null)
                // Name van de klasse vergelijken met Name van het object
                return game.Score.CompareTo(Score);
            else
                throw new Exception("Object is not of type Collectible");
        }
    }
}
