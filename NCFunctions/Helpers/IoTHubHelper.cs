using Microsoft.Azure.Devices;
using NCFunctions.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace NCFunctions.Helpers
{
    public class IoTHubHelper
    {
        private const string _DEVICEID = "testdevice";
        public static ServiceClient GetServiceClient()
        {
            return ServiceClient.CreateFromConnectionString(Environment.GetEnvironmentVariable("IoTHubAdmin"));
        }

        public static async Task StartGameMethod(Game game)
        {
            try
            {
                ServiceClient client = GetServiceClient();

                // Save the game details in a string
                string payloadGame = JsonConvert.SerializeObject(game);

                // Send method 'startgame'
                CloudToDeviceMethod method = new CloudToDeviceMethod("startgame");
                // Add game to the payload
                method.SetPayloadJson(payloadGame);

                await client.InvokeDeviceMethodAsync(_DEVICEID, method);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
