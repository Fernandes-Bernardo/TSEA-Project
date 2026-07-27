package com.server.api.config;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.mqtt")
public class MqttProperties {

    private boolean enabled = true;
    private String brokerUrl = "tcp://broker.hivemq.com:1883";
    private String clientId = "zaiko-api";
    private String username = "";
    private String password = "";
    private long pulseDurationMs = 5000;
    private String topic = "zaiko/servos";
    private int servoCount = 6;
    private String toolServos = "";

    /**
     * Mapa nomeDaFerramenta=servo(1..servoCount). A comparacao e por nome exato
     * contra Tools.name; par malformado ou fora da faixa e descartado.
     */
    public Map<String, Integer> parsedToolServos() {
        Map<String, Integer> mapa = new LinkedHashMap<>();
        if (toolServos == null || toolServos.isBlank()) return mapa;
        for (String par : toolServos.split(",")) {
            String t = par.trim();
            int eq = t.lastIndexOf('=');
            if (eq <= 0 || eq >= t.length() - 1) continue;
            try {
                int servo = Integer.parseInt(t.substring(eq + 1).trim());
                if (servo >= 1 && servo <= servoCount) {
                    mapa.put(t.substring(0, eq).trim(), servo);
                }
            } catch (NumberFormatException ignored) {
            }
        }
        return mapa;
    }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getBrokerUrl() { return brokerUrl; }
    public void setBrokerUrl(String brokerUrl) { this.brokerUrl = brokerUrl; }
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public long getPulseDurationMs() { return pulseDurationMs; }
    public void setPulseDurationMs(long pulseDurationMs) { this.pulseDurationMs = pulseDurationMs; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public int getServoCount() { return servoCount; }
    public void setServoCount(int servoCount) { this.servoCount = servoCount; }
    public String getToolServos() { return toolServos; }
    public void setToolServos(String toolServos) { this.toolServos = toolServos; }
}
