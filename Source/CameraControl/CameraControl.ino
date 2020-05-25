#include <LibLanc.h>
Lanc lanc(11, 10);
#define PAN_LEFT_PIN  5
#define PAN_RIGHT_PIN  3
#define TILT_UP_PIN  9
#define TILT_DOWN_PIN  6

void setup(void)
{
  Serial.begin(500000);
  pinMode(PAN_LEFT_PIN, OUTPUT);
  pinMode(PAN_RIGHT_PIN, OUTPUT);
  pinMode(TILT_UP_PIN, OUTPUT);
  pinMode(TILT_DOWN_PIN, OUTPUT);
  pinMode(LED_BUILTIN, OUTPUT);

  lanc.begin();

  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB
  }
}

bool aliveState = false;
void loop(void)
{
  digitalWrite(LED_BUILTIN, aliveState);
  aliveState = !aliveState;
  getCurrentCommand();
  lanc.loop();
}

/**
   Ask the counterpart connected via Serial port for the next commands to execute.
   Commands are formatted as CSV and should follow this pattern:
   |     Pan     |    Tilt     |   Zoom  |  Focus  |
   | -255 .. 255 | -255 .. 255 | -8 .. 8 | -1 .. 1 |

   This function processes the input and issues the according commands

   @note Please note that focus commands override zoom commands
*/
void getCurrentCommand() {
  Serial.println("next");

  auto read = Serial.readStringUntil('\n');
  int startCharacter = read.indexOf('@');
  if (startCharacter >= 0) {
    auto commands = read.substring(startCharacter + 1);
    processPan(getStringPart(commands, ','));
    processTilt(getStringPart(commands, ','));
    processZoom(getStringPart(commands, ','));
    processFocus(getStringPart(commands, ','));
  }
}

/**
  Return the first part of the string by searching for the separator.
  The string given with @p data is modified so that it just contains the remaining string
*/
String getStringPart(String &data, char separator)
{
  int strIndex[] = { 0, -1 };
  int maxIndex = data.length() - 1;

  for (int i = 0; i <= maxIndex; i++) {
    if (data.charAt(i) == separator) {
      auto retval = data.substring(0, i);
      data = data.substring(i + 1);
      return retval;
    }
  }
  auto retval = data;
  data = "";
  return retval;
}

void processPan(String stringValue) {
  // conversion will return zero if no valid integer
  int value = stringValue.toInt();

  if (value < 0) {
    analogWrite(PAN_RIGHT_PIN, 0);
    analogWrite(PAN_LEFT_PIN, -value);
  } else {
    analogWrite(PAN_LEFT_PIN, 0);
    analogWrite(PAN_RIGHT_PIN, value);
  }
}

void processTilt(String stringValue) {
  // conversion will return zero if no valid integer
  int value = stringValue.toInt();

  if (value < 0) {
    analogWrite(TILT_UP_PIN, 0);
    analogWrite(TILT_DOWN_PIN, -value);
  } else {
    analogWrite(TILT_DOWN_PIN, 0);
    analogWrite(TILT_UP_PIN, value);
  }
}

void processZoom(String stringValue) {
  // conversion will return zero if no valid integer
  int value = stringValue.toInt();

  // A value of zero will already clear the command
  // therefore no need here to clear manually
  lanc.Zoom(value);
}

void processFocus(String stringValue) {
  // conversion will return zero if no valid integer
  int value = stringValue.toInt();
  switch (value) {
    case 1:
      lanc.Focus(false);
      break;
    case -1:
      lanc.Focus(true);
      break;
    default:
      // Don't clear command. This command unfortunately
      // overwrites the Zoom command since it is processed later.
      // (unfortunately the lanc protocol does not allow simultanous operation 
      // of both commands)
      break;
  }
}
