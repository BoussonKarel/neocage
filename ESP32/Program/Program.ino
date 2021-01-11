#include "Adafruit_VL53L0X.h"
#include <Adafruit_NeoPixel.h>

// address we will assign if dual sensor is present
#define LOX1_ADDRESS 0x30
#define LOX2_ADDRESS 0x31
#define LOX3_ADDRESS 0x32
//#define LOX4_ADDRESS 0x32

// set the pins to shutdown
#define SHT_LOX1 4
#define SHT_LOX2 16
#define SHT_LOX3 17
//#define SHT_LOX4 0

// objects for the vl53l0x
Adafruit_VL53L0X lox1 = Adafruit_VL53L0X();
Adafruit_VL53L0X lox2 = Adafruit_VL53L0X();
Adafruit_VL53L0X lox3 = Adafruit_VL53L0X();
//Adafruit_VL53L0X lox4 = Adafruit_VL53L0X();

Adafruit_VL53L0X sensors[] = {lox1, lox2, lox3};
//Adafruit_VL53L0X sensors[] = {lox1, lox2, lox3, lox4};

#define LED_PIN 5
#define JEWEL_COUNT 3
int LED_COUNT = JEWEL_COUNT * 7;

int sensitivity = 75;
int lastGoal;

Adafruit_NeoPixel leds(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

bool activeSensors[3] = { false, false, false };
int lastValue[3] = {0,0,0};
int doneRondo[3] = {false,false,false};


void toggleSensor(int index) {
  bool waarde = activeSensors[index];
  activeSensors[index] = !waarde;
}

void setID() {
  // all reset
  digitalWrite(SHT_LOX1, LOW);
  digitalWrite(SHT_LOX2, LOW);
  digitalWrite(SHT_LOX3, LOW);
  //digitalWrite(SHT_LOX4, LOW);
  delay(100);
  // all unreset
  digitalWrite(SHT_LOX1, HIGH);
  digitalWrite(SHT_LOX2, HIGH);
  digitalWrite(SHT_LOX3, HIGH);
  //digitalWrite(SHT_LOX4, HIGH);
  delay(100);

  // activating LOX1 and reseting LOX2
  digitalWrite(SHT_LOX1, HIGH);
  digitalWrite(SHT_LOX2, LOW);
  digitalWrite(SHT_LOX3, LOW);
  //digitalWrite(SHT_LOX4, LOW);

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
  
  /* activating LOX3
  digitalWrite(SHT_LOX4, HIGH);
  delay(100);

  //initing LOX3
  if (!lox4.begin(LOX4_ADDRESS)) {
    Serial.println(F("Failed to boot 4 VL53L0X"));
    while (1);
  }*/

  lox1.configSensor(Adafruit_VL53L0X::VL53L0X_SENSE_HIGH_ACCURACY);
  lox2.configSensor(Adafruit_VL53L0X::VL53L0X_SENSE_HIGH_ACCURACY);
  lox3.configSensor(Adafruit_VL53L0X::VL53L0X_SENSE_HIGH_ACCURACY);
  //lox4.configSensor(Adafruit_VL53L0X::VL53L0X_SENSE_HIGH_ACCURACY);

  sensors[0] = lox1;
  sensors[1] = lox2;
  sensors[2] = lox3;
  //sensors[3] = lox4;
  
  //Led aanzetten
  leds.begin();
  leds.setBrightness(5);
  leds.fill(leds.Color(255, 255, 255), 0, LED_COUNT);
  leds.show();
}

void setup() {
  Serial.begin(115200);

  randomSeed(millis());
  // wait until serial port opens for native USB devices
  while (! Serial) {
    delay(1);
  }

  Serial.println(F("dqsdqsdqsd pins inited..."));
  delay(100);
  pinMode(SHT_LOX1, OUTPUT);
  pinMode(SHT_LOX2, OUTPUT);
  pinMode(SHT_LOX3, OUTPUT);
  //pinMode(SHT_LOX4, OUTPUT);

  Serial.println(F("Shutdown pins inited..."));

  digitalWrite(SHT_LOX1, LOW);
  digitalWrite(SHT_LOX2, LOW);
  digitalWrite(SHT_LOX3, LOW);
  //digitalWrite(SHT_LOX4, LOW);

  setID();
}

void setJewel(int jewel, int red, int green, int blue) {
  jewel = jewel * 7;
  //Todo Als de jewel groter is dan aantal dan neits aan ofz
  leds.fill(leds.Color(red, green, blue), jewel, 7);
  leds.show();
}

int readSensor(int sensorId) {
  VL53L0X_RangingMeasurementData_t measurement;
  int milli;
  do {
    sensors[sensorId].rangingTest(&measurement, false); // pass in 'true'
    milli =  measurement.RangeMilliMeter; 
    //Serial.println(String(sensorId) + " raw: " + milli);
  } while(measurement.RangeStatus == 4 || milli > 8190 || milli <= 1);

  Serial.println(String(sensorId) + " geslaagd: " + milli);
  return milli;
}

void checkSensors() {
  for(int i = 0; i < JEWEL_COUNT; i++) {
    if(activeSensors[i] == true) {
      //Meting doen
      int value = readSensor(i);
      int valueWithSensitivity = value + sensitivity;
      if(valueWithSensitivity < lastValue[i]) {
        Serial.println("GOAAAAAAAAAAAAAAAAAAAAAAAAL");
        //er is gescoord
        toggleSensor(i);
        //return true als er gescoord is
        //lastValue[i] = value;
        doneRondo[i] = true;
        lastGoal = i;
        for(int i = 0; i < JEWEL_COUNT; i++) {
          lastValue[i] = 0;
        }
      }
      else {
        lastValue[i] = value;
      }
    }
  }
}

void theRondo() {
  leds.fill(leds.Color(255, 0, 0), 0, LED_COUNT);
  leds.show();
  unsigned long startMillis = millis();

  //alle sensors aanzetten
  for(int i = 0; i < JEWEL_COUNT; i++) {
    toggleSensor(i);
    doneRondo[i] = false;
  }
  
  while(doneRondo[0] == false || doneRondo[1] == false ||doneRondo[2] == false) {
    checkSensors();
    for(int j = 0; j < JEWEL_COUNT; j++) {
      if(activeSensors[j]==false) {
        setJewel(j, 0,255,0);
      }
    }
  }
  Serial.println("The rondo done");
  for(int i = 0; i < JEWEL_COUNT; i++) {
    lastValue[i] = 0;
  }
   
  leds.fill(leds.Color(255, 255, 255), 0, LED_COUNT);
  leds.show();
  delay(1000);
  leds.fill(leds.Color(255, 0, 0), 0, LED_COUNT);
  leds.show();
  delay(1000);
  leds.fill(leds.Color(255, 255, 255), 0, LED_COUNT);
  leds.show();
  delay(1000);  
}

void quickyTricky(int duration) {
  duration = duration * 1000; //Van ms naar seconden
  leds.fill(leds.Color(0, 0, 255), 0, LED_COUNT);
  leds.show();

  unsigned long previousMillis = millis();
  unsigned long currentMillis = millis();
  
  int maxNum = JEWEL_COUNT;
  int randNumber;
  
  while (currentMillis - previousMillis <= duration) {
    //Checken of er een sensor aanstaat -> nee? -> random sensor aan
    if(activeSensors[0] == true || activeSensors[1] == true ||activeSensors[2] == true) {
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

  for(int i = 0; i < JEWEL_COUNT; i++) {
    activeSensors[i] = false;
    lastValue[i] = 0;
  }
  
  //Serial.println("Game score " + String(currentScore)); 
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
  //quickyTricky(30);
  theRondo();
  //read_dual_sensors();
  //delay(2000);

}
