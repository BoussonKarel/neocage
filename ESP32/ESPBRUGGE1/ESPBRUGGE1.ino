/*
  1. Devicetwin ophalen & leds status aanpassen indien nodig
  2. De reported aanpassen en doorsturen.
  3. Wachten totdat twin device gechanged wordt
  4. Indien led aanstaat checken dat de TOF geen bal detecteerd
  5. Wordt de bal gedetecteerd dan doorsturen naar iothub via message
*/

/*
 Libraries
*/

#include <WiFi.h>
#include "Esp32MQTTClient.h"

/*
 Globale variabelen
*/
const char* ssid = "KAMER5";
const char* password = "AABBCCDDAA";
/* Deze variabele uniek! */
static const char* connectionString = "HostName=IoTNeoCage.azure-devices.net;DeviceId=ESPBRUGGE01;SharedAccessKey=psK7dYZpKtJ6wrvWccz79NqtIlzZfvNvpNWcmioLxWI=";
static bool hasIoTHub = false;
static bool hasWifi = false;

static void SendConfirmationCallback(IOTHUB_CLIENT_CONFIRMATION_RESULT result)
{
  if (result == IOTHUB_CLIENT_CONFIRMATION_OK)
  {
    Serial.println("Send Confirmation Callback finished.");
  }
}

/*
  Indien er een message wordt ontvangen  
*/
static void MessageCallback(const char* payLoad, int size)
{
  Serial.println("Message callback:");
  Serial.println(payLoad);
}

/*
  Indien de devicetwin aangepast wordt
*/
static void DeviceTwinCallback(DEVICE_TWIN_UPDATE_STATE updateState, const unsigned char *payLoad, int size)
{
  char *temp = (char *)malloc(size + 1);
  if (temp == NULL)
  {
    return;
  }
  memcpy(temp, payLoad, size);
  temp[size] = '\0';
  // Display Twin message.
  Serial.println(temp);
  free(temp);
}

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 Device");
  Serial.println("Initializing...");
  Serial.println(" > WiFi");
  Serial.println("Starting connecting WiFi.");
  delay(10);
  WiFi.mode(WIFI_AP);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print("Wifi not connected");
    hasWifi = false;
  }
  hasWifi = true;
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.println(" > IoT Hub");
  if (!Esp32MQTTClient_Init((const uint8_t*)connectionString, true))
  {
    hasIoTHub = false;
    Serial.println("Initializing IoT hub failed.");
    return;
  }
  hasIoTHub = true;
  Esp32MQTTClient_SetSendConfirmationCallback(SendConfirmationCallback);
  Esp32MQTTClient_SetMessageCallback(MessageCallback);
  Esp32MQTTClient_SetDeviceTwinCallback(DeviceTwinCallback);
  /*Esp32MQTTClient_SetDeviceMethodCallback(DeviceMethodCallback);*/
}

void loop(){
  Esp32MQTTClient_Check();
}
