#include "Adafruit_VL53L0X.h"
#include <Adafruit_NeoPixel.h>

Adafruit_VL53L0X lox = Adafruit_VL53L0X();
VL53L0X_RangingMeasurementData_t measure;

#define LED_PIN 5
#define LED_COUNT 7

int laatste =0;
int speel =1;

Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

void setup() {
  Serial.begin(115200);

//Led aanzetten
  strip.begin();
  strip.show();

  // wait until serial port opens for native USB devices
  while (! Serial) {
    delay(1);
  }
  
  Serial.println("Adafruit VL53L0X test");
  if (!lox.begin()) {
    Serial.println(F("Failed to boot VL53L0X"));
    while(1);
  }
  // power 
  Serial.println(F("VL53L0X API Simple Ranging example\n\n")); 


  if (measure.RangeStatus != 4 && measure.RangeMilliMeter < 8000 ) {  // phase failures have incorrect data
      lox.rangingTest(&measure, false); // pass in 'true' to get debug data printout!
      laatste = measure.RangeMilliMeter;
  } else {
    //Serial.println(" out of range ");
  }
}


void loop() {
  if(speel==1) {
      //Serial.print("Reading a measurement... ");
      lox.rangingTest(&measure, false); // pass in 'true' to get debug data printout!
    
      if (measure.RangeStatus != 4 && measure.RangeMilliMeter < 8000 ) {  // phase failures have incorrect data
        Serial.print("Distance (mm): "); Serial.println(measure.RangeMilliMeter);
        if(measure.RangeMilliMeter + 100 < laatste) {
          Serial.println("GOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL");
          speel = 0;
        }
        laatste = measure.RangeMilliMeter;
      } else {
        //Serial.println(" out of range ");
      }
  }
  else {
    delay(3000);
    speel = 1;
  }
    
}
