#include <WiFi.h>
#include <ESP32Servo.h>
#include <PubSubClient.h>

const char* ssid = "net";
const char* password = "1234";

const char* mqtt_server = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient client(espClient);


Servo servos[6];

const int servoPins[6] = {18, 19, 21, 22, 23, 25};

// WiFi
void connectWiFi() {
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  Serial.println("WiFi conectado");
}

// MQTT
void connectMQTT() {
  while (!client.connected()) {
    if (client.connect("ESP32Client")) {
      Serial.println("MQTT conectado");

      // subscribe em todos os tópicos
      for (int i = 1; i <= 6; i++) {
        String topic = "servo/" + String(i) + "/set";
        client.subscribe(topic.c_str());
      }

    } else {
      delay(2000);
    }
  }
}

// Setup dos servos
void setupServos() {
  for (int i = 0; i < 6; i++) {
    servos[i].attach(servoPins[i]);
    servos[i].write(0);
  }
}

// Controlador de servo
void handleServo(int index, int angle) {
  if (index < 0 || index >= 6) return;

  servos[index].write(angle);

  Serial.print("Servo ");
  Serial.print(index + 1);
  Serial.print(" -> ");
  Serial.println(angle);
}

// Callback MQTT
void callback(char* topic, byte* payload, unsigned int length) {
  String msg;

  for (int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }

  int angle = msg.toInt();

  // descobrir qual servo pelo tópico
  for (int i = 1; i <= 6; i++) {
    String expected = "servo/" + String(i) + "/set";

    if (String(topic) == expected) {
      handleServo(i - 1, angle);
      break;
    }
  }
}

void setup() {
  Serial.begin(115200);

  setupServos();
  connectWiFi();

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    connectMQTT();
  }

  client.loop();
}