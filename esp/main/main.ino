#include <WiFi.h>
#include <ESP32Servo.h>
#include <PubSubClient.h>

const char* WIFI_SSID = "duda";
const char* WIFI_PASSWORD = "tjal1244";

const char* MQTT_HOST = "broker.hivemq.com";
const uint16_t MQTT_PORT = 1883;
const char* MQTT_CLIENT_ID = "ZaikoESP32";

// Topico unico. O payload diz QUAL servo mover: "<servo>:<ms>", ex "3:5000".
// O ":<ms>" e opcional e cai em DEFAULT_PULSE_MS quando ausente.
const char* MQTT_TOPIC = "zaiko/servos";

// Servo 1..6 na ordem dos pinos abaixo.
const uint8_t SERVO_COUNT = 6;
const int SERVO_PINS[SERVO_COUNT] = {18, 19, 21, 22, 5, 23};

const int PULSE_MIN_US = 500;
const int PULSE_MAX_US = 2400;

const int ACTIVE_ANGLE = 180;
const int REST_ANGLE = 0;
const unsigned long DEFAULT_PULSE_MS = 5000;

const uint8_t LED_COUNT = 2;
const int LED_PINS[LED_COUNT] = {27, 26};

Servo servos[SERVO_COUNT];
// Prazo de retorno independente por servo: cada um volta no seu proprio tempo.
unsigned long servoReturnAt[SERVO_COUNT];
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
        servos[i].attach(SERVO_PINS[i], PULSE_MIN_US, PULSE_MAX_US);
        servos[i].write(REST_ANGLE);
        servoReturnAt[i] = 0;
    }
}


void setupLed() {
    for (uint8_t i = 0; i < LED_COUNT; i++) {
        pinMode(LED_PINS[i], OUTPUT);
        digitalWrite(LED_PINS[i], LOW);
    }
    ledOffAt = 0;
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
    for (uint8_t i = 0; i < LED_COUNT; i++) {
        digitalWrite(LED_PINS[i], on ? HIGH : LOW);
    }
    Serial.print("[led] -> ");
    Serial.println(on ? "ON" : "OFF");
}


void triggerServo(uint8_t index, unsigned long durationMs) {
    if (index >= SERVO_COUNT) return;
    moveServo(index, ACTIVE_ANGLE);

    unsigned long off = millis() + durationMs;
    // Comando novo para o mesmo servo so estende o prazo, nunca encurta.
    if (off > servoReturnAt[index]) servoReturnAt[index] = off;
    if (off > ledOffAt) ledOffAt = off;
    setLed(true);

    Serial.print("[servo ");
    Serial.print(index + 1);
    Serial.print(" acionado por ");
    Serial.print(durationMs);
    Serial.println(" ms]");
}


void tick() {
    unsigned long now = millis();
    for (uint8_t i = 0; i < SERVO_COUNT; i++) {
        if (servoReturnAt[i] != 0 && now >= servoReturnAt[i]) {
            moveServo(i, REST_ANGLE);
            servoReturnAt[i] = 0;
        }
    }
    // LED apaga quando o ultimo servo ativo termina.
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


void mqttCallback(char* topic, byte* payload, unsigned int length) {
    if (strcmp(topic, MQTT_TOPIC) != 0) return;

    String msg;
    msg.reserve(length);
    for (unsigned int i = 0; i < length; i++) {
        msg += (char) payload[i];
    }
    msg.trim();

    // "<servo>:<ms>", com ":<ms>" opcional.
    int sep = msg.indexOf(':');
    long servo = (sep >= 0 ? msg.substring(0, sep) : msg).toInt();
    long ms = (sep >= 0) ? msg.substring(sep + 1).toInt() : 0;

    if (servo < 1 || servo > SERVO_COUNT) {
        Serial.print("[ignorado] servo fora da faixa 1..");
        Serial.print(SERVO_COUNT);
        Serial.print(", payload: ");
        Serial.println(msg);
        return;
    }
    if (ms <= 0) ms = DEFAULT_PULSE_MS;
    if (ms > 60000) ms = 60000;

    triggerServo((uint8_t) (servo - 1), (unsigned long) ms);
}


void subscribeTopic() {
    mqtt.subscribe(MQTT_TOPIC);
    Serial.print("Assinado em ");
    Serial.println(MQTT_TOPIC);
}


bool ensureMqtt() {
    if (mqtt.connected()) return true;
    if (!ensureWiFi()) return false;
    String clientId = String(MQTT_CLIENT_ID) + "-" + String((uint32_t) ESP.getEfuseMac(), HEX);
    Serial.print("Conectando ao MQTT como ");
    Serial.println(clientId);
    if (mqtt.connect(clientId.c_str())) {
        Serial.println("MQTT conectado.");
        subscribeTopic();
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
