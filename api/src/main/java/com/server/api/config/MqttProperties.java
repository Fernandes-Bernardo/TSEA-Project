package com.server.api.config;

import java.util.HashMap;
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
    private int pulseAngle = 180;
    private long pulseDurationMs = 5000;
    private String toolMapping = "";

    public Map<String, Integer> parsedMapping() {
        Map<String, Integer> map = new HashMap<>();
        if (toolMapping == null || toolMapping.isBlank()) return map;
        for (String pair : toolMapping.split(",")) {
            String trimmed = pair.trim();
            int eq = trimmed.lastIndexOf('=');
            if (eq <= 0 || eq >= trimmed.length() - 1) continue;
            String name = trimmed.substring(0, eq).trim();
            try {
                int servo = Integer.parseInt(trimmed.substring(eq + 1).trim());
                if (servo >= 1 && servo <= 6) {
                    map.put(name, servo);
                }
            } catch (NumberFormatException ignored) {
            }
        }
        return map;
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
    public int getPulseAngle() { return pulseAngle; }
    public void setPulseAngle(int pulseAngle) { this.pulseAngle = pulseAngle; }
    public long getPulseDurationMs() { return pulseDurationMs; }
    public void setPulseDurationMs(long pulseDurationMs) { this.pulseDurationMs = pulseDurationMs; }
    public String getToolMapping() { return toolMapping; }
    public void setToolMapping(String toolMapping) { this.toolMapping = toolMapping; }
}
