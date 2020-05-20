#include <LibLanc.h>
#include <Bridge.h>
#include <BridgeServer.h>
#include <BridgeClient.h>

// Listen to the default port 5555, the Yún webserver
// will forward there all the HTTP requests you send
BridgeServer server;

const int LancOut = 1;  // the pin which is connected to Lanc Output
const int LancIn = 2;  // the pin which is connected to Lanc Input

void setup(void)
{
  // Bridge takes about two seconds to start up
  // it can be helpful to use the on-board LED
  // as an indicator for when it has initialized
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  Bridge.begin();
  digitalWrite(LED_BUILTIN, HIGH);

  Lanc::InstanceGet()->Setup(LancIn, LancOut);

  // Listen for incoming connection only from localhost
  // (no one from the external network could connect)
  server.listenOnLocalhost();
  server.begin();
}


// The main program will print the blink count
// to the Arduino Serial Monitor
void loop(void)
{ // Get clients coming from server
  BridgeClient client = server.accept();

  // There is a new client?
  if (client) {
    // Process request
    process(client);

    // Close connection and free resources.
    client.stop();
  }

  //Poll as Quickly as possible
  //delay(50); // Poll every 50ms
}

void process(BridgeClient client) {
  // read the command
  String command = client.readStringUntil('/');

  if (command == "zoom") {
    zoomCommand(client);
  }

  if (command == "focus") {
    focusCommand(client);
  }

  if (command == "autoFocus") {
    autoFocusCommand(client);
  }
}

void zoomCommand(BridgeClient client) {
  int value;

  // Read zoom value
  value = client.parseInt();

  bool successful = false;
  if (value >= -8 && value <= 8) {
    successful = Lanc::InstanceGet()->Zoom((int8_t) value);
  }

  // Send feedback to client
  client.print(F("Zoom Value"));
  client.print(value);
  client.print(F(" sent successfully:"));
  client.println(successful);

  // Update datastore key with the current pin value
  String key = "Zoom";
  Bridge.put(key, String(value));
}

void focusCommand(BridgeClient client) {
  int value;

  // Read focus value
  value = client.parseInt();

  bool successful = false;
  if (value >= 0 && value <= 1) {
    successful = Lanc::InstanceGet()->Zoom((bool) value);
  }

  // Send feedback to client
  client.print(F("Focus Value"));
  client.print(value);
  client.print(F(" sent successfully:"));
  client.println(successful);

  // Update datastore key with the current pin value
  String key = "Focus";
  Bridge.put(key, String(value));
}

void autoFocusCommand(BridgeClient client) {
  bool successful = Lanc::InstanceGet()->AutoFocus();

  // Send feedback to client
  client.print(F("Autofocus Command sent successfully:"));
  client.println(successful);
}
