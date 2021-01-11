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

// this holds the measurement
VL53L0X_RangingMeasurementData_t measure1;
VL53L0X_RangingMeasurementData_t measure2;
VL53L0X_RangingMeasurementData_t measure3;
//VL53L0X_RangingMeasurementData_t measure4;

//VL53L0X_RangingMeasurementData_t measures[] = {measure1,measure2,measure3};

#define LED_PIN 5
#define JEWEL_COUNT 3
int LED_COUNT = JEWEL_COUNT * 7;

int sensitivity = 50;

Adafruit_NeoPixel leds(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

/*
    Reset all sensors by setting all of their XSHUT pins low for delay(10), then set all XSHUT high to bring out of reset
    Keep sensor #1 awake by keeping XSHUT pin high
    Put all other sensors into shutdown by pulling XSHUT pins low
    Initialize sensor #1 with lox.begin(new_i2c_address) Pick any number but 0x29 and it must be under 0x7F. Going with 0x30 to 0x3F is probably OK.
    Keep sensor #1 awake, and now bring sensor #2 out of reset by setting its XSHUT pin high.
    Initialize sensor #2 with lox.begin(new_i2c_address) Pick any number but 0x29 and whatever you set the first sensor to
*/
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


  //Led aanzetten
  leds.begin();
  leds.setBrightness(5);
  leds.fill(leds.Color(255, 255, 255), 0, LED_COUNT);
  leds.show();
}

void read_dual_sensors() {

  lox1.rangingTest(&measure1, false); // pass in 'true' to get debug data printout!
  lox2.rangingTest(&measure2, false); // pass in 'true' to get debug data printout!
  lox3.rangingTest(&measure3, false); // pass in 'true' to get debug data printout!
  //lox4.rangingTest(&measure4, false); // pass in 'true' to get debug data printout!

  // print sensor one reading
  Serial.print(F("1: "));
  if (measure1.RangeStatus != 4) {    // if not out of range
    Serial.print(measure1.RangeMilliMeter);
  } else {
    Serial.print(F("Out of range"));
  }

  Serial.print(F(" "));

  // print sensor two reading
  Serial.print(F("2: "));
  if (measure2.RangeStatus != 4) {
    Serial.print(measure2.RangeMilliMeter);
  } else {
    Serial.print(F("Out of range"));
  }

  Serial.print(F(" "));

  // print sensor two reading
  Serial.print(F("3: "));
  if (measure3.RangeStatus != 4) {
    Serial.print(measure3.RangeMilliMeter);
  } else {
    Serial.print(F("Out of range"));
  }

  Serial.print(F(" "));

  /* print sensor two reading
  Serial.print(F("4: "));
  if (measure4.RangeStatus != 4) {
    Serial.print(measure4.RangeMilliMeter);
  } else {
    Serial.print(F("Out of range"));
  }*/

  Serial.print(F(" "));
  
  Serial.println();
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

  Serial.println(F("Both in reset mode...(pins are low)"));


  Serial.println(F("Starting..."));
  setID();
}

void setJewel(int jewel, int red, int green, int blue) {
  jewel = jewel - 1;
  jewel = jewel * 7;
  //Todo Als de jewel groter is dan aantal dan neits aan ofz
  leds.fill(leds.Color(red, green, blue), jewel, 7);
  leds.show();
}

int readSensor(int sensorId, bool IndexOrNot) {
  if(IndexOrNot) {
      sensorId = sensorId - 1;
      
      sensors[sensorId].rangingTest(&measurement, false); // pass in 'true'
      while(measurement.RangeStatus == 4 || measurement.RangeMilliMeter > 8190) {
        sensors[sensorId].rangingTest(&measurement, false); // pass in 'true'
      } 
      Serial.println(String(sensorId) + ": " + measurement.RangeMilliMeter);
      return measurement.RangeMilliMeter;
  }
  else {
      sensors[sensorId].rangingTest(&measurement, false); // pass in 'true'
      while(measurement.RangeStatus == 4 || measurement.RangeMilliMeter > 8190) {
        sensors[sensorId].rangingTest(&measurement, false); // pass in 'true'
      } 
      Serial.println(String(sensorId) + ": " + measurement.RangeMilliMeter);
      return measurement.RangeMilliMeter;
  }

  VL53L0X_RangingMeasurementData_t measurement;
  sensors[sensorId].rangingTest(&measurement, false); // pass in 'true'

  while(measurement.RangeStatus == 4 || measurement.RangeMilliMeter > 8190) {
    sensors[sensorId].rangingTest(&measurement, false); // pass in 'true'
  } 
  Serial.println(measurement.RangeMilliMeter);
  return measurement.RangeMilliMeter;
}

void quickyTricky(int duration) {
  //duration * 1000 want komt als secondenbinnen
  //leds resetten
  leds.fill(leds.Color(0, 0, 255), 0, LED_COUNT);
  leds.show();

  unsigned long previousMillis = millis();
  unsigned long currentMillis = millis();

  int currentLed = 1;
  int previousLed = 1;

  int value = readSensor(currentLed);
  int laatste = readSensor(currentLed);
  while (currentMillis - previousMillis <= duration) {
    //Als er nog geen {duration} seconden zijn gepasseerd ->spelen
    //Licht 1 op rood en wachten op een goal
    setJewel(currentLed, 255, 0, 0);
    //Wachten op goal van sensor 1
    //Serial.println("Value: " + String(readSensor(currentLed)));
    value = readSensor(currentLed,1) + sensitivity;
    //Serial.println("Value + 30: " + String(value));
    //Serial.println("Laatste: " +  String(laatste));
    if(value < laatste ) {
      //Er is gescoord
      //huidige led op groen, volgende willekeurige led op rood
      //na enkele seconden groene led terug op wit
      //Doorsturen backend
      Serial.println("GOAAAAAAAAAAAAAAAAAAAL");
      previousLed = currentLed;
      //random volgende kiezen uit jewel amount -> mag niet de vorige zijn
      int maxNum = JEWEL_COUNT +1;
      int randNumber = previousLed;
      do {
        randNumber =random(1,maxNum);
      }while(randNumber == previousLed);
      currentLed = randNumber;
      setJewel(previousLed,0,0,255);
      delay(10);
      setJewel(currentLed,255,0,0);
      //TODO: Score bijhouden
      //Doorsturen IOTHUB
    }
    laatste = value - sensitivity;   
    currentMillis = millis();
  }
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
  quickyTricky(60000);
  delay(1000);
}
