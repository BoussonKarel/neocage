using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace NCFunctions.Models
{
    public class IoTMessage
    {
        [JsonProperty("type")]
        public string Type { get; set; }
        [JsonProperty("payload")]
        public string Payload { get; set; }
    }
}
