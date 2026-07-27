// Teste isolado de UM servo, sem WiFi e sem MQTT.
// Roda 3 fases e imprime o que observar em cada uma. O objetivo e separar
// (a) alimentacao fraca de (b) pulso alem do batente mecanico do servo.
//
// COMO LER O RESULTADO:
//   FASE 1 (parado em 90, faixa conservadora)
//       silencioso e firme  -> alimentacao esta OK
//       treme ja aqui       -> o problema e ALIMENTACAO (corrente da fonte / GND)
//   FASE 2 (60 e 120, faixa conservadora)
//       move limpo          -> servo e sinal estao bons
//   FASE 3 (0 e 180, faixa larga, a mesma do main.ino)
//       so agora comeca a tremer/zumbir -> o servo esta forcando o BATENTE
//       mecanico. A correcao e no codigo, estreitando a faixa no main.ino.

#include <ESP32Servo.h>

const int TEST_PIN = 18;

// Faixa segura: praticamente todo servo hobby aceita sem forcar o batente.
const int PULSO_SEGURO_MIN = 1000;
const int PULSO_SEGURO_MAX = 2000;

// Faixa larga: exatamente a que o main.ino usa hoje.
const int PULSO_LARGO_MIN = 500;
const int PULSO_LARGO_MAX = 2400;

Servo s;


void fase(const char* titulo) {
    Serial.println();
    Serial.print("=== ");
    Serial.print(titulo);
    Serial.println(" ===");
}


void posicao(int angulo, unsigned long ms) {
    Serial.print("  angulo ");
    Serial.println(angulo);
    s.write(angulo);
    delay(ms);
}


void setup() {
    Serial.begin(115200);
    delay(300);
    ESP32PWM::allocateTimer(0);
    s.setPeriodHertz(50);
    Serial.print("Teste de servo no pino ");
    Serial.println(TEST_PIN);
}


void loop() {
    s.attach(TEST_PIN, PULSO_SEGURO_MIN, PULSO_SEGURO_MAX);

    fase("FASE 1 - parado em 90, deve ficar em silencio");
    posicao(90, 4000);

    fase("FASE 2 - 60 e 120, faixa conservadora");
    posicao(60, 1500);
    posicao(120, 1500);
    posicao(90, 1000);

    s.detach();
    s.attach(TEST_PIN, PULSO_LARGO_MIN, PULSO_LARGO_MAX);

    fase("FASE 3 - 0 e 180, faixa larga igual a do main.ino");
    posicao(0, 2000);
    posicao(180, 2000);

    s.detach();
    fase("FIM - servo solto por 3s, repetindo o ciclo");
    delay(3000);
}
