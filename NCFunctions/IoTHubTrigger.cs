using IoTHubTrigger = Microsoft.Azure.WebJobs.EventHubTriggerAttribute;

using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Azure.EventHubs;
using System.Text;
using System.Net.Http;
using Microsoft.Extensions.Logging;
using NCFunctions.Models;
using Newtonsoft.Json;
using NCFunctions.Helpers;
using System;
using System.Threading.Tasks;

namespace NCFunctions
{
    public static class IoTHubTrigger
    {
        private static HttpClient client = new HttpClient();

        [FunctionName("IoTHubTrigger")]
        public static async Task Run([EventHubTrigger("messages/events", Connection = "IoTHub")]EventData message, ILogger log)
        {
            try
            {
                // Device sends a message
                string messageBody = Encoding.UTF8.GetString(message.Body.Array);
                Game messageGame = JsonConvert.DeserializeObject<Game>(messageBody);

                await GameHelper.GameUpdate(messageGame);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            
        }
    }
}