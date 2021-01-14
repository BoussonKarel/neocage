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
        private static string _DEVICEID = Environment.GetEnvironmentVariable("deviceid");
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

        public static async Task StopGameMethod()
        {
            try
            {
                ServiceClient client = GetServiceClient();

                // Send method 'stopgame'
                CloudToDeviceMethod method = new CloudToDeviceMethod("stopgame");

                await client.InvokeDeviceMethodAsync(_DEVICEID, method);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public static async Task<Game> CurrentGameMethod()
        {
            try
            {
                ServiceClient client = GetServiceClient();

                // Send method 'stopgame'
                CloudToDeviceMethod method = new CloudToDeviceMethod("currentgame");

                CloudToDeviceMethodResult result = await client.InvokeDeviceMethodAsync(_DEVICEID, method);

                if (result.Status == 404)
                    return null; // No game
                
                Game currentGame = JsonConvert.DeserializeObject<Game>(result.GetPayloadAsJson());

                return currentGame;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
