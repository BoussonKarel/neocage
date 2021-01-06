using System;
using System.Collections.Generic;
using System.Text;

namespace NCFunctions.Models
{
    public class Game
    {
        public Guid Id { get; set; }
        public string GamemodeId { get; set; }
        public int? Duration { get; set; }
        public int Score { get; set; }
    }
}
