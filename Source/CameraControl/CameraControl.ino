#include <LibLanc.h>
#include <PWM.h>

Lanc lanc(11, 10);
#define PAN_LEFT_PIN  5
#define PAN_RIGHT_PIN  3
#define TILT_UP_PIN  9
#define TILT_DOWN_PIN  6
#define PWM_FREQUENCY 35 //frequency (in Hz)

typedef void (*tReceptionState)(uint8_t revieced);

void Reception_WaitForStart(uint8_t received);
void Reception_Receiving(uint8_t received);
void Reception_ReceptionComplete(uint8_t received);

uint8_t receiveString[6];
uint8_t receivePosition;
tReceptionState receptionState;
int lastCommandRequest;

void setup(void)
{
  Serial.begin(500000);

  //initialize all timers except for 0, to save time keeping functions
  InitTimersSafe();

  pinMode(PAN_LEFT_PIN, OUTPUT);
  pinMode(PAN_RIGHT_PIN, OUTPUT);
  pinMode(TILT_UP_PIN, OUTPUT);
  pinMode(TILT_DOWN_PIN, OUTPUT);

  //sets the frequency for the specified pin
  bool success = SetPinFrequencySafe(TILT_UP_PIN, PWM_FREQUENCY);
  success &= SetPinFrequencySafe(TILT_DOWN_PIN, PWM_FREQUENCY);
  success &= SetPinFrequencySafe(PAN_LEFT_PIN, PWM_FREQUENCY);
  success &= SetPinFrequencySafe(PAN_RIGHT_PIN, PWM_FREQUENCY);

  if (success) {
    pinMode(LED_BUILTIN, OUTPUT);
    digitalWrite(LED_BUILTIN, HIGH);
  }

  lanc.begin();

  receptionState = Reception_WaitForStart;
  lastCommandRequest = 0;

  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB
  }
}

void loop(void)
{
  getCurrentCommand();
  lanc.loop();
}

void requestCommand() {
  lastCommandRequest = millis();
  Serial.println("v1");
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
  // read things
  while (Serial.available() > 0) {
    receptionState((uint8_t)Serial.read());
  }

  // process when receptionComplete
  if (receptionState == Reception_ReceptionComplete) {
    processPan();
    processTilt();
    processZoom();
    processFocus();
    receptionState = Reception_WaitForStart;
    requestCommand();
  }

  // get next command if last reception is too long waited for
  if ((millis() - lastCommandRequest) > 1000) {
    requestCommand();
  }
}

int decodePanTilt(uint8_t * data) {
  uint8_t lowValue = data[1] - '@';
  uint8_t highValue = data[0] - '@';
  bool negative = highValue & (1 << 4);
  int retval = ((highValue % 16) << 5) + lowValue;
  return (negative) ? -retval : retval;
}

int decodeZoomFocus(uint8_t * data) {
  uint8_t value = data[0] - '@';
  bool negative = (value & (1 << 4)) > 0;
  int retval = value % 16;
  return (negative) ? -retval : retval;
}

void processPan() {
  int value = decodePanTilt(&receiveString[0]);

  if (value < 0) {
    pwmWrite(PAN_RIGHT_PIN, 0);
    pwmWrite(PAN_LEFT_PIN, -value);
  } else {
    pwmWrite(PAN_LEFT_PIN, 0);
    pwmWrite(PAN_RIGHT_PIN, value);
  }
}

void processTilt() {
  int value = decodePanTilt(&receiveString[2]);

  if (value < 0) {
    pwmWrite(TILT_UP_PIN, 0);
    pwmWrite(TILT_DOWN_PIN, -value);
  } else {
    pwmWrite(TILT_DOWN_PIN, 0);
    pwmWrite(TILT_UP_PIN, value);
  }
}

void processZoom() {
  int value = decodeZoomFocus(&receiveString[4]);

  // A value of zero will already clear the command
  // therefore no need here to clear manually
  lanc.Zoom(value);
}

void processFocus() {
  int value = decodeZoomFocus(&receiveString[5]);
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

void Reception_WaitForStart(uint8_t received) {
  if (received == '?') {
    receptionState = Reception_Receiving;
    receivePosition = 0;
  }
}
void Reception_Receiving(uint8_t received) {
  if (received == '\n') {
    receptionState = Reception_ReceptionComplete;
  } else if (receivePosition < (sizeof(receiveString) / sizeof(receiveString[0]))) {
    receiveString[receivePosition] = received;
    receivePosition ++;
  }
}
void Reception_ReceptionComplete(uint8_t received) {
  (void) received;
  // do nothing intentionally
}
