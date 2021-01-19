using System;
using System.Collections.Generic;
using System.Text;
using uPLibrary.Networking.M2Mqtt;
using uPLibrary.Networking.M2Mqtt.Messages;

namespace NCFunctions.Helpers
{
    public class MqttHelper
    {
        public static void SendMessage(string topic, string message)
        {
            //Connecting
            string brokerHost = Environment.GetEnvironmentVariable("MqttHost");
            MqttClient client = new MqttClient(brokerHost);
            string clientId = Guid.NewGuid().ToString();
            client.Connect(clientId);

            //sending messages
            client.Publish(topic, Encoding.UTF8.GetBytes(message), MqttMsgBase.QOS_LEVEL_AT_LEAST_ONCE, false);
        }
    }
}
