#include <WiFi.h>
#include <ESP32Servo.h>
#include <PubSubClient.h>

const char* WIFI_SSID = "ESP32-ZAIKO";
const char* WIFI_PASSWORD = "z4iko4321";

const char* MQTT_HOST = "broker.hivemq.com";
const uint16_t MQTT_PORT = 1883;
const char* MQTT_CLIENT_ID = "ZaikoESP32";

const uint8_t SERVO_COUNT = 6;
const int SERVO_PINS[SERVO_COUNT] = {18, 19, 21, 22, 23, 25};
const int SERVO_REST_ANGLE = 0;

Servo servos[SERVO_COUNT];
int currentAngle[SERVO_COUNT];
unsigned long returnAtMs[SERVO_COUNT];

WiFiClient espClient;
PubSubClient mqtt(espClient);


void setupSerial() {
    Serial.begin(115200);
    delay(50);
}


void setupServos() {
    for (uint8_t i = 0; i < SERVO_COUNT; i++) {
        servos[i].setPeriodHertz(50);
        servos[i].attach(SERVO_PINS[i], 500, 2400);
        moveServo(i, SERVO_REST_ANGLE);
        returnAtMs[i] = 0;
    }
}


void moveServo(uint8_t index, int angle) {
    if (index >= SERVO_COUNT) return;
    angle = constrain(angle, 0, 180);
    servos[index].write(angle);
    currentAngle[index] = angle;
    Serial.print("[servo ");
    Serial.print(index + 1);
    Serial.print("] -> ");
    Serial.println(angle);
}


void pulseServo(uint8_t index, int angle, unsigned long durationMs) {
    moveServo(index, angle);
    returnAtMs[index] = millis() + durationMs;
}


void tickServos() {
    unsigned long now = millis();
    for (uint8_t i = 0; i < SERVO_COUNT; i++) {
        if (returnAtMs[i] != 0 && now >= returnAtMs[i]) {
            moveServo(i, SERVO_REST_ANGLE);
            returnAtMs[i] = 0;
        }
    }
}


void connectWiFi() {
    Serial.print("Conectando ao WiFi: ");
    Serial.println(WIFI_SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
        delay(400);
        Serial.print(".");
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.print("\nWiFi conectado. IP: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nFalha ao conectar no WiFi. Tentando novamente em background.");
    }
}


bool ensureWiFi() {
    if (WiFi.status() == WL_CONNECTED) return true;
    connectWiFi();
    return WiFi.status() == WL_CONNECTED;
}


int parseServoFromTopic(const char* topic) {
    if (strncmp(topic, "servo/", 6) != 0) return -1;
    const char* p = topic + 6;
    int n = 0;
    while (*p && *p != '/') {
        if (*p < '0' || *p > '9') return -1;
        n = n * 10 + (*p - '0');
        p++;
    }
    if (n < 1 || n > SERVO_COUNT) return -1;
    return n - 1;
}


bool topicEndsWith(const char* topic, const char* suffix) {
    size_t tl = strlen(topic);
    size_t sl = strlen(suffix);
    if (sl > tl) return false;
    return strcmp(topic + (tl - sl), suffix) == 0;
}


void handleSetMessage(uint8_t index, const String& payload) {
    int angle = payload.toInt();
    moveServo(index, angle);
    if (angle != SERVO_REST_ANGLE) {
        returnAtMs[index] = 0;
    }
}


void handlePulseMessage(uint8_t index, const String& payload) {
    int sep = payload.indexOf(':');
    int angle = (sep > 0) ? payload.substring(0, sep).toInt() : payload.toInt();
    long ms = (sep > 0) ? payload.substring(sep + 1).toInt() : 5000;
    if (ms <= 0) ms = 5000;
    if (ms > 60000) ms = 60000;
    pulseServo(index, angle, (unsigned long) ms);
}


void mqttCallback(char* topic, byte* payload, unsigned int length) {
    String msg;
    msg.reserve(length);
    for (unsigned int i = 0; i < length; i++) {
        msg += (char) payload[i];
    }
    int idx = parseServoFromTopic(topic);
    if (idx < 0) return;

    if (topicEndsWith(topic, "/set")) {
        handleSetMessage((uint8_t) idx, msg);
    } else if (topicEndsWith(topic, "/pulse")) {
        handlePulseMessage((uint8_t) idx, msg);
    }
}


void subscribeAll() {
    for (uint8_t i = 1; i <= SERVO_COUNT; i++) {
        String setTopic = "servo/" + String(i) + "/set";
        String pulseTopic = "servo/" + String(i) + "/pulse";
        mqtt.subscribe(setTopic.c_str());
        mqtt.subscribe(pulseTopic.c_str());
    }
}


bool ensureMqtt() {
    if (mqtt.connected()) return true;
    if (!ensureWiFi()) return false;
    String clientId = String(MQTT_CLIENT_ID) + "-" + String((uint32_t) ESP.getEfuseMac(), HEX);
    Serial.print("Conectando ao MQTT como ");
    Serial.println(clientId);
    if (mqtt.connect(clientId.c_str())) {
        Serial.println("MQTT conectado.");
        subscribeAll();
        return true;
    }
    Serial.print("MQTT falhou, rc=");
    Serial.println(mqtt.state());
    return false;
}


void setupMqtt() {
    mqtt.setServer(MQTT_HOST, MQTT_PORT);
    mqtt.setKeepAlive(30);
    mqtt.setSocketTimeout(8);
    mqtt.setCallback(mqttCallback);
}


void setup() {
    setupSerial();
    setupServos();
    connectWiFi();
    setupMqtt();
    ensureMqtt();
}


void loop() {
    if (!mqtt.connected()) {
        static unsigned long lastTry = 0;
        if (millis() - lastTry > 3000) {
            lastTry = millis();
            ensureMqtt();
        }
    } else {
        mqtt.loop();
    }
    tickServos();
}
