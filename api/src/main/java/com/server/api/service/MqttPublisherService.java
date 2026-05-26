package com.server.api.service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import org.eclipse.paho.client.mqttv3.IMqttClient;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.server.api.config.MqttProperties;

@Service
public class MqttPublisherService {

    private static final Logger log = LoggerFactory.getLogger(MqttPublisherService.class);

    private final MqttProperties props;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "mqtt-servo-scheduler");
        t.setDaemon(true);
        return t;
    });

    private IMqttClient client;
    private Map<String, Integer> mapping;

    public MqttPublisherService(MqttProperties props) {
        this.props = props;
    }

    @PostConstruct
    public void start() {
        this.mapping = props.parsedMapping();
        if (!props.isEnabled()) {
            log.info("MQTT desativado por configuração (app.mqtt.enabled=false).");
            return;
        }
        try {
            client = new MqttClient(props.getBrokerUrl(), props.getClientId() + "-" + UUID.randomUUID().toString().substring(0, 6), new MemoryPersistence());
            MqttConnectOptions opts = new MqttConnectOptions();
            opts.setAutomaticReconnect(true);
            opts.setCleanSession(true);
            opts.setConnectionTimeout(5);
            if (!props.getUsername().isEmpty()) {
                opts.setUserName(props.getUsername());
                opts.setPassword(props.getPassword().toCharArray());
            }
            client.connect(opts);
            log.info("MQTT conectado em {} ({} mapeamentos carregados)", props.getBrokerUrl(), mapping.size());
        } catch (MqttException ex) {
            log.warn("Falha ao conectar no broker MQTT ({}). Pulsos para o ESP serão ignorados.", ex.getMessage());
        }
    }

    @PreDestroy
    public void shutdown() {
        scheduler.shutdownNow();
        if (client != null && client.isConnected()) {
            try {
                client.disconnect();
                client.close();
            } catch (MqttException ignored) {
            }
        }
    }

    public Integer servoForTool(String toolName) {
        if (toolName == null || mapping == null) return null;
        return mapping.get(toolName);
    }

    public void pulseServoForTool(String toolName) {
        Integer servo = servoForTool(toolName);
        if (servo == null) return;
        pulseServo(servo, props.getPulseAngle(), props.getPulseDurationMs());
    }

    public void pulseServo(int servoNumber, int angle, long durationMs) {
        if (!isConnected()) {
            log.debug("MQTT não conectado. Ignorando pulso do servo {}.", servoNumber);
            return;
        }
        publish(servoNumber, angle);
        scheduler.schedule(() -> publish(servoNumber, 0), durationMs, TimeUnit.MILLISECONDS);
    }

    private void publish(int servoNumber, int angle) {
        String topic = "servo/" + servoNumber + "/set";
        MqttMessage msg = new MqttMessage(String.valueOf(angle).getBytes());
        msg.setQos(1);
        msg.setRetained(false);
        try {
            client.publish(topic, msg);
            log.info("MQTT -> {} = {}", topic, angle);
        } catch (MqttException ex) {
            log.warn("Falha ao publicar em {}: {}", topic, ex.getMessage());
        }
    }

    public boolean isConnected() {
        return client != null && client.isConnected();
    }
}
