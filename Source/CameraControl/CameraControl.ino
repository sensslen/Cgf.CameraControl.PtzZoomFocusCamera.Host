#include <LibLanc.h>
#include <Bridge.h>
#include <BridgeServer.h>
#include <BridgeClient.h>

// Listen to the default port 5555, the Yún webserver
// will forward there all the HTTP requests you send
BridgeServer server;
Lanc lanc(11,10);

void setup(void)
{
  // Bridge takes about two seconds to start up
  // it can be helpful to use the on-board LED
  // as an indicator for when it has initialized
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  Bridge.begin();
  digitalWrite(LED_BUILTIN, HIGH);

  // Listen for incoming connection only from localhost
  // (no one from the external network could connect)
  server.listenOnLocalhost();
  server.begin();

  lanc.begin();
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
    successful = lanc.Zoom((int8_t) value);
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
    lanc.Focus((bool) value);
    successful = true;
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
  lanc.AutoFocus();

  // Send feedback to client
  client.print(F("Autofocus toggle Command sent."));
}
