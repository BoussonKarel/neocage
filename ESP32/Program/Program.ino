#include "Adafruit_VL53L0X.h"
#include <Adafruit_NeoPixel.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include "Esp32MQTTClient.h"
#include "time.h"

// address we will assign if dual sensor is present
#define LOX1_ADDRESS 0x30
#define LOX2_ADDRESS 0x31
#define LOX3_ADDRESS 0x32
#define LOX4_ADDRESS 0x33

// set the pins to shutdown
#define SHT_LOX1 0
#define SHT_LOX2 4
#define SHT_LOX3 16
#define SHT_LOX4 17

// objects for the vl53l0x
Adafruit_VL53L0X lox1 = Adafruit_VL53L0X();
Adafruit_VL53L0X lox2 = Adafruit_VL53L0X();
Adafruit_VL53L0X lox3 = Adafruit_VL53L0X();
Adafruit_VL53L0X lox4 = Adafruit_VL53L0X();

Adafruit_VL53L0X sensors[] = {lox1, lox2, lox3, lox4};

#define LED_PIN 5
#define JEWEL_COUNT 4
int LED_COUNT = JEWEL_COUNT * 7;

Adafruit_NeoPixel leds(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

//Game variables
int sensitivity = 75;
int lastGoal;
bool activeSensors[4] = { false, false, false, false };
int lastValue[4] = {0,0,0,0};
int doneRondo[4] = {false,false,false,false};
String currentGame = "";
String gameID = "";
int currentDuration;
int gameScore = 0;
String currentGameTitle = "";
String currentTimeStarted = "";
int DoubleTroubleScore1 = 0;
int DoubleTroubleScore2 = 0;

//IoTHub
//const char* ssid = "Howest-IoT";
//const char* password = "LZe5buMyZUcDpLY";
// const char* ssid = "kamer";
// const char* password = "AABBCCDDAA";
// const char* ssid = "Wii35-2,4GHz";
// const char* password = "wxcvbnAZ12";
const char* ssid = "nietnicoswifi";
const char* password = "ikbenesp123";
static const char* connectionString = "HostName=IoTNeoCage.azure-devices.net;DeviceId=ESPBRUGGE01;SharedAccessKey=psK7dYZpKtJ6wrvWccz79NqtIlzZfvNvpNWcmioLxWI=";
static bool hasIoTHub = false;
static bool hasWifi = false;
#define MESSAGE_MAX_LEN 256


//MultiThreading
TaskHandle_t Task0;

//Tijd ophalen
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 3600;
const int daylightOffset_sec = 0;
struct tm timeinfo;
struct tm timeStartedGame;

void setup() {
  Serial.begin(115200);

  randomSeed(millis());
  // wait until serial port opens for native USB devices
  while (! Serial) {
    delay(1);
  }

  WiFi.mode(WIFI_AP);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
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
  Esp32MQTTClient_SetSendConfirmationCallback(SendConfirmationCallback);
  Esp32MQTTClient_SetMessageCallback(MessageCallback);
  //Esp32MQTTClient_SetDeviceTwinCallback(DeviceTwinCallback);
  Esp32MQTTClient_SetDeviceMethodCallback(DeviceMethodCallback);

  Serial.println(F("dqsdqsdqsd pins inited..."));
  delay(100);
  pinMode(SHT_LOX1, OUTPUT);
  pinMode(SHT_LOX2, OUTPUT);
  pinMode(SHT_LOX3, OUTPUT);
  pinMode(SHT_LOX4, OUTPUT);

  Serial.println(F("Shutdown pins inited..."));

  digitalWrite(SHT_LOX1, LOW);
  digitalWrite(SHT_LOX2, LOW);
  digitalWrite(SHT_LOX3, LOW);
  digitalWrite(SHT_LOX4, LOW);

  //MultiThreading -> Task0 draait op cpu0, loop draait op cpu1. De task krijgt 8192 bytes memory
  xTaskCreatePinnedToCore(Task0Code,"Task0",8192,NULL,0,&Task0,0);


  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  if(!getLocalTime(&timeinfo)){
    Serial.println("Failed to obtain time");
    return;
  }
  Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");
  Serial.print("Day of week: ");
  
  setID();
    
  //Led aanzetten
  leds.begin();
  leds.setBrightness(5);
  leds.fill(leds.Color(255, 255, 255), 0, LED_COUNT);
  leds.show();
}

void Task0Code(void * parameter) {
  int currentSeconds;
  int gameSeconds;
  for(;;) {
    vTaskDelay(1);
    //De huidige tijd updaten
    getLocalTime(&timeinfo);

    currentSeconds = timeinfo.tm_hour * 3600 + timeinfo.tm_min *60 + timeinfo.tm_sec;
    gameSeconds = timeStartedGame.tm_hour * 3600 + timeStartedGame.tm_min *60 + timeStartedGame.tm_sec;
    if(currentSeconds >= gameSeconds) {
      if(currentGame=="quickytricky") {
        quickyTricky(currentDuration);
      }
      else if(currentGame=="therondo") {
        theRondo();
      }
      else if(currentGame=="doubletrouble") {
        doubleTrouble();
      }
    }

  }
}

static int  DeviceMethodCallback(const char *methodName, const unsigned char *payload, int size, unsigned char **response, int *response_size)
{
  LogInfo("Trying to invoke method %s", methodName);
  const char *responseMessage = "\"Successfully invoke device method\"";
  int result = 200;

  if (strcmp(methodName, "startgame") == 0)
  {
    StaticJsonDocument<800> doc;

    // Deserialize the JSON document
    DeserializationError error = deserializeJson(doc, payload);
    // Test if parsing succeeds.
    if (error) {
      Serial.print(F("deserializeJson() failed: "));
      Serial.println(error.f_str());
    }
    
    String gamemode = doc["gamemode_id"];
    currentDuration = doc["duration"];  
    String title =  doc["gamemode"];
    currentGameTitle = title;
    String tijd = doc["timestarted"];
    currentTimeStarted = tijd;

    //Currnetime started omvormen naar een tm object
    String jaar = String(currentTimeStarted[0]) + String(currentTimeStarted[1])+ String(currentTimeStarted[2])+ String(currentTimeStarted[3]);
    String maand = String(currentTimeStarted[5]) + String(currentTimeStarted[6]);
    String dag = String(currentTimeStarted[8]) + String(currentTimeStarted[9]);
    String uur = String(currentTimeStarted[5]) + String(currentTimeStarted[6]);
    String minuut = String(currentTimeStarted[11]) + String(currentTimeStarted[12]);
    String sec = String(currentTimeStarted[14]) + String(currentTimeStarted[15]);

    timeStartedGame.tm_year = jaar.toInt();
    timeStartedGame.tm_mon = maand.toInt();
    timeStartedGame.tm_mday = dag.toInt();
    timeStartedGame.tm_hour = uur.toInt();
    timeStartedGame.tm_min = minuut.toInt();
    timeStartedGame.tm_sec = sec.toInt();
    
    String id = doc["id"];
    gameID = id;
    // Print values.
    Serial.println(gamemode);
    Serial.println(currentDuration);
    //voor game starten -> succes code sturen naar backend
    if(gamemode != "therondo" && gamemode != "quickytricky" && gamemode != "doubletrouble") {
      Serial.println("game unknown");
      responseMessage = "{\"error\": game unknown}";
      result = 404;
    }
    else {
      currentGame = gamemode;
    }
    
  }
  else if (strcmp(methodName, "currentgame") == 0)
  {
    if(currentGame != "") {
      DynamicJsonDocument doc(1024);
      doc["id"] = gameID; 
      doc["gamemode_id"] = currentGame; 
      doc["duration"] = currentDuration; 
      doc["score"] = gameScore;
      doc["gamemode"] = currentGameTitle;
      doc["timestarted"] = currentTimeStarted;
      char json[256];
      serializeJson(doc, json);
      Serial.println(json);
      responseMessage = json;
      result = 200;
    }
    else {
      responseMessage = "{\"id\": null}";
      result = 404;
    }
  }
  else if (strcmp(methodName, "stopgame") == 0)
  {
    currentGame = "";
    for(int i = 0; i < JEWEL_COUNT; i++) {
      activeSensors[i] = false;
      lastValue[i] = 0;
      doneRondo[i] = true;
    }
    gameScore = 0;  
    lastGoal = 0;
    LogInfo("Stop spel");
    DynamicJsonDocument doc(1024);
    doc["stopped"] = "true";
    char json[256];
    serializeJson(doc, json);
    Serial.println(json);   
    responseMessage = json;    

  }
  else
  {
    LogInfo("No method %s found", methodName);
    responseMessage = "\"No method found\"";
    result = 404;
  }

  *response_size = strlen(responseMessage) + 1;
  *response = (unsigned char *)strdup(responseMessage);

  return result;
}

static void SendConfirmationCallback(IOTHUB_CLIENT_CONFIRMATION_RESULT result)
{
  //Check of IotHub de message ontvangen heeft.
  if (result == IOTHUB_CLIENT_CONFIRMATION_OK)
  {
    Serial.println("Send Confirmation Callback finished.");
  }
}

static void MessageCallback(const char* payLoad, int size)
{
  //Indien er een message binnenkomt van iothub (niet gebruikt atm)
  Serial.println("Message callback:");
  Serial.println(payLoad);
}

void toggleSensor(int index) {
  bool waarde = activeSensors[index];
  activeSensors[index] = !waarde;
}

void setID() {
  // all reset
  digitalWrite(SHT_LOX1, LOW);
  digitalWrite(SHT_LOX2, LOW);
  digitalWrite(SHT_LOX3, LOW);
  digitalWrite(SHT_LOX4, LOW);
  
  delay(100);
  // all unreset
  digitalWrite(SHT_LOX1, HIGH);
  digitalWrite(SHT_LOX2, HIGH);
  digitalWrite(SHT_LOX3, HIGH);
  digitalWrite(SHT_LOX4, HIGH);
  
  delay(100);

  // activating LOX1 and reseting LOX2
  digitalWrite(SHT_LOX1, HIGH);
  digitalWrite(SHT_LOX2, LOW);
  digitalWrite(SHT_LOX3, LOW);
  digitalWrite(SHT_LOX4, LOW);

  // initing LOX1
  if (!lox1.begin(LOX1_ADDRESS)) {
    Serial.println(F("Failed to boot first VL53L0X"));
    while (1);
  }
  delay(100);

  // activating LOX2
  digitalWrite(SHT_LOX2, HIGH);
  delay(100);

  //initing LOX2
  if (!lox2.begin(LOX2_ADDRESS)) {
    Serial.println(F("Failed to boot second VL53L0X"));
    while (1);
  }

  // activating LOX3
  digitalWrite(SHT_LOX3, HIGH);
  delay(100);

  //initing LOX3
  if (!lox3.begin(LOX3_ADDRESS)) {
    Serial.println(F("Failed to boot 3 VL53L0X"));
    while (1);
  }
  
  // activating LOX4
  digitalWrite(SHT_LOX4, HIGH);
  delay(100);

  //initing LOX4
  if (!lox4.begin(LOX4_ADDRESS)) {
    Serial.println(F("Failed to boot 4 VL53L0X"));
    while (1);
  }

/*
  lox1.configSensor(Adafruit_VL53L0X::VL53L0X_SENSE_HIGH_ACCURACY);
  lox2.configSensor(Adafruit_VL53L0X::VL53L0X_SENSE_HIGH_ACCURACY);
  lox3.configSensor(Adafruit_VL53L0X::VL53L0X_SENSE_HIGH_ACCURACY);
  lox4.configSensor(Adafruit_VL53L0X::VL53L0X_SENSE_HIGH_ACCURACY);
*/
  sensors[0] = lox1;
  sensors[1] = lox2;
  sensors[2] = lox3;
  sensors[3] = lox4;
}

void setJewel(int jewel, int red, int green, int blue) {
  //Verandert een bepaalde jewel (jewel bestaat uit 7 leds) in een kleur volgens RGB waarden
  jewel = jewel * 7;
  //Todo Als de jewel groter is dan aantal dan neits aan ofz
  leds.fill(leds.Color(red, green, blue), jewel, 7);
  leds.show();
}

int readSensor(int sensorId) {
  //Een sensor uitlezen volgens index waarde van de sensor
  VL53L0X_RangingMeasurementData_t measurement;
  int milli;
  //1 keer meeten en indien er een foutmelding is (rangestatus == 4 of meting == 8191 dan opnieuw meten totdat er een juiste meting is.
  do {
    sensors[sensorId].rangingTest(&measurement, false); // pass in 'true'
    milli =  measurement.RangeMilliMeter; 
    Serial.println(String(sensorId) + " Meting raw: " + milli);    
  } while(measurement.RangeStatus == 4 || milli > 8190); //  || milli <= 1

  Serial.println(String(sensorId) + " geslaagd: " + milli);
  return milli;
}

void checkSensors() {
  //Alle sensors uitlezen indien deze uitgelezen dient te worden.
  for(int i = 0; i < JEWEL_COUNT; i++) {
    if(activeSensors[i] == true) {
      //Meting doen
      int value = readSensor(i);

      int valueWithSensitivity = value + sensitivity;
      //Indien de ingelezen waarde + de buffer (sensitivity) kleiner is dan de vorige gemeten waarde dan is er gescoord.
      if(valueWithSensitivity < lastValue[i]) {
        Serial.println("GOAAAAAAAAAAAAAAAAAAAAAAAAL");
        //er is gescoord
        //return true als er gescoord is
        lastGoal = i;
        if(currentGame == "therondo") {
          setJewel(i, 0,255,0);
          doneRondo[i] = true;
          toggleSensor(i);
          gameScore++;          
        }
        else if(currentGame =="doubletrouble") {
          if(i < JEWEL_COUNT/2) {
            //speler 1 scoort
            DoubleTroubleScore1++;
            gameScore = gameScore +10;
          }
          else {
            //speler 2 scoort
            DoubleTroubleScore2++;
            gameScore = gameScore +1;
            //Serial.println("Score 2" + DoubleTroubleScore1);
          }
        }
        else {
          //QUicky tricky
          gameScore++;
          toggleSensor(i);
        }
        Serial.println(gameScore);
        gameUpdate();

        //Alle vorige values worden op 0 gezet om problemen te verkomen
        for(int j = 0; j < JEWEL_COUNT; j++) {
          lastValue[j] = 0;
        }

      }
      else {
        lastValue[i] = value;
      }
    }
  }
}

void theRondo() {
  delay(5000);
  sensitivity = 100;
  leds.fill(leds.Color(255, 0, 0), 0, LED_COUNT);
  leds.show();
  unsigned long startMillis = millis();

  //alle sensors aanzetten
  for(int i = 0; i < JEWEL_COUNT; i++) {
    toggleSensor(i);
    doneRondo[i] = false;
  }
  //Zolang er nog minstens 1 doneRondo == false dan moeten de sensors ingelezen worden
  while(doneRondo[0] == false || doneRondo[1] == false ||doneRondo[2] == false ||doneRondo[3] == false && currentGame != "") {
    checkSensors();
  }
  //Alle lichten zijn  uit -> Millis en kijken hoeveel het verschil is
  unsigned long endMillis = millis();
  gameScore = endMillis - startMillis;
  gameScore = gameScore/1000;
  
  gameOff();

}

void quickyTricky(int duration) {
  sensitivity = 100;
  delay(5000);
  duration = duration * 1000; //Van ms naar seconden
  leds.fill(leds.Color(0, 0, 255), 0, LED_COUNT);
  leds.show();

  unsigned long previousMillis = millis();
  unsigned long currentMillis = millis();
  
  int maxNum = JEWEL_COUNT;
  int randNumber;
  
  while (currentMillis - previousMillis <= duration && currentGame != "") {
    //Checken of er een sensor aanstaat -> nee? -> random sensor aan
    if(activeSensors[0] == true || activeSensors[1] == true ||activeSensors[2] == true ||activeSensors[3] == true) {
      checkSensors();
    }
    else {
      do {
        randNumber =random(0,maxNum);
      }while(randNumber == lastGoal);
      activeSensors[randNumber] = true;
      Serial.println("Random number " + String(randNumber));
      //Led aanzetten
      setJewel(lastGoal,0,0,255);      
      setJewel(randNumber,255,0,0);
    }
    currentMillis = millis();
  }
  //alles uit
  gameOff();

}

void doubleTrouble() {
  delay(5000);
  sensitivity = 100;
  //tientallen -> speler 1  andere -> speler 2
  //Eerste speler die aan 5 komt wint 
  //speler 1 is bv rood, speler 2 bv blauw
  //Ledjes 2 rood, 2 blauw
  for(int i = 0; i < JEWEL_COUNT; i++) {
    if(i < JEWEL_COUNT/2) {
      setJewel(i,255,0,0);
    }
    else {
      setJewel(i,0,0,255);
    }
    toggleSensor(i);
  }

  //Zolang geen enekele score groter is dan 4 -> sensors uitlezen
  while(DoubleTroubleScore1 < 2 && DoubleTroubleScore2 < 2) {
     checkSensors();
  }
  
  gameOff();
}

void D2C(String typeUpdate) {
  if (typeUpdate == "stopgame"){
    DynamicJsonDocument doc(1024);
    doc["stopped"] = true; 
    char json[256];
    serializeJson(doc, json);
    EVENT_INSTANCE* message = Esp32MQTTClient_Event_Generate(json, MESSAGE);
    Esp32MQTTClient_SendEventInstance(message);
  } 
  else {
    DynamicJsonDocument doc(1024);
    doc["type"] = typeUpdate;
    doc["payload"] = "{\"id\":\""+gameID+"\", \"gamemode_id\":\""+currentGame+"\",\"gamemode\":\""+ currentGameTitle +"\"  , \"duration\":"+currentDuration+",\"timestarted\":\""+ currentTimeStarted +"\",\"score\":"+gameScore+"}";
    char json[256];
    serializeJson(doc, json);
    EVENT_INSTANCE* message = Esp32MQTTClient_Event_Generate(json, MESSAGE);
    Esp32MQTTClient_SendEventInstance(message);
  }
}

void gameUpdate() {
  D2C("game_update");
}

void gameOff() {
  //Scores doorsturen
  D2C("game_end");

  //Alles resetten
  for(int i = 0; i < JEWEL_COUNT; i++) {
    activeSensors[i] = false;
    lastValue[i] = 0;
    doneRondo[i] = true;
  }
  currentGame = "";
  gameID = "";
  currentDuration = 0;
  gameScore = 0;
  lastGoal = 0;
  DoubleTroubleScore1 = 0;
  DoubleTroubleScore2 = 0;

  leds.fill(leds.Color(255, 255, 255), 0, LED_COUNT);
  leds.show();
  delay(1000);
  leds.fill(leds.Color(255, 0, 0), 0, LED_COUNT);
  leds.show();
  delay(1000);
  leds.fill(leds.Color(255, 255, 255), 0, LED_COUNT);
  leds.show();
}

void loop() {
  Esp32MQTTClient_Check();
  vTaskDelay(1);
}
