#include <WiFi.h>
#include <ESP32Servo.h>
#include <PubSubClient.h>

const char* WIFI_SSID = "ESP32-ZAIKO";
const char* WIFI_PASSWORD = "z4iko4321";

const char* MQTT_HOST = "broker.hivemq.com";
const uint16_t MQTT_PORT = 1883;
const char* MQTT_CLIENT_ID = "ZaikoESP32";

const char* STATION_TOPIC_PREFIX = "zaiko/station/";

const uint8_t SERVO_COUNT = 4;
const int SERVO_PINS[SERVO_COUNT] = {18, 19, 21, 22};
const int LED_PIN = 23;

const int ACTIVE_ANGLE = 180;
const int REST_ANGLE = 0;
const unsigned long DEFAULT_PULSE_MS = 5000;

const uint8_t STATION_COUNT = 2;
const int STATION_SERVOS[STATION_COUNT][2] = {{0, 1}, {2, 3}};

Servo servos[SERVO_COUNT];
unsigned long stationReturnAt[STATION_COUNT];
unsigned long ledOffAt = 0;

WiFiClient espClient;
PubSubClient mqtt(espClient);


void setupSerial() {
    Serial.begin(115200);
    delay(50);
}


void setupServos() {
    ESP32PWM::allocateTimer(0);
    ESP32PWM::allocateTimer(1);
    ESP32PWM::allocateTimer(2);
    ESP32PWM::allocateTimer(3);
    for (uint8_t i = 0; i < SERVO_COUNT; i++) {
        servos[i].setPeriodHertz(50);
        servos[i].attach(SERVO_PINS[i], 500, 2400);
        servos[i].write(REST_ANGLE);
    }
    for (uint8_t s = 0; s < STATION_COUNT; s++) {
        stationReturnAt[s] = 0;
    }
}


void setupLed() {
    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, LOW);
}


void moveServo(uint8_t index, int angle) {
    if (index >= SERVO_COUNT) return;
    angle = constrain(angle, 0, 180);
    servos[index].write(angle);
    Serial.print("[servo ");
    Serial.print(index + 1);
    Serial.print("] -> ");
    Serial.println(angle);
}


void setLed(bool on) {
    digitalWrite(LED_PIN, on ? HIGH : LOW);
    Serial.print("[led] -> ");
    Serial.println(on ? "ON" : "OFF");
}


void triggerStation(uint8_t station, unsigned long durationMs) {
    if (station >= STATION_COUNT) return;
    for (uint8_t k = 0; k < 2; k++) {
        moveServo(STATION_SERVOS[station][k], ACTIVE_ANGLE);
    }
    stationReturnAt[station] = millis() + durationMs;

    setLed(true);
    unsigned long off = millis() + durationMs;
    if (off > ledOffAt) ledOffAt = off;

    Serial.print("[estacao ");
    Serial.print(station + 1);
    Serial.print("] acionada por ");
    Serial.print(durationMs);
    Serial.println(" ms");
}


void tick() {
    unsigned long now = millis();
    for (uint8_t s = 0; s < STATION_COUNT; s++) {
        if (stationReturnAt[s] != 0 && now >= stationReturnAt[s]) {
            for (uint8_t k = 0; k < 2; k++) {
                moveServo(STATION_SERVOS[s][k], REST_ANGLE);
            }
            stationReturnAt[s] = 0;
        }
    }
    if (ledOffAt != 0 && now >= ledOffAt) {
        setLed(false);
        ledOffAt = 0;
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


int parseStationFromTopic(const char* topic) {
    size_t prefixLen = strlen(STATION_TOPIC_PREFIX);
    if (strncmp(topic, STATION_TOPIC_PREFIX, prefixLen) != 0) return -1;
    const char* p = topic + prefixLen;
    int n = 0;
    bool hasDigit = false;
    while (*p) {
        if (*p < '0' || *p > '9') return -1;
        n = n * 10 + (*p - '0');
        hasDigit = true;
        p++;
    }
    if (!hasDigit) return -1;
    if (n < 1 || n > STATION_COUNT) return -1;
    return n - 1;
}


void mqttCallback(char* topic, byte* payload, unsigned int length) {
    String msg;
    msg.reserve(length);
    for (unsigned int i = 0; i < length; i++) {
        msg += (char) payload[i];
    }
    int station = parseStationFromTopic(topic);
    if (station < 0) return;

    long ms = msg.toInt();
    if (ms <= 0) ms = DEFAULT_PULSE_MS;
    if (ms > 60000) ms = 60000;
    triggerStation((uint8_t) station, (unsigned long) ms);
}


void subscribeStations() {
    for (uint8_t s = 1; s <= STATION_COUNT; s++) {
        String topic = String(STATION_TOPIC_PREFIX) + String(s);
        mqtt.subscribe(topic.c_str());
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
        subscribeStations();
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
    setupLed();
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
    tick();
}
