package com.server.api.service;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

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
    private IMqttClient client;
    private Map<String, Integer> mapping;

    public MqttPublisherService(MqttProperties props) {
        this.props = props;
    }

    @PostConstruct
    public void start() {
        this.mapping = props.parsedMapping();
        if (!props.isEnabled()) {
            log.info("MQTT desativado por configuracao (app.mqtt.enabled=false).");
            return;
        }
        try {
            String id = props.getClientId() + "-" + UUID.randomUUID().toString().substring(0, 6);
            client = new MqttClient(props.getBrokerUrl(), id, new MemoryPersistence());
            MqttConnectOptions opts = new MqttConnectOptions();
            opts.setAutomaticReconnect(true);
            opts.setCleanSession(true);
            opts.setConnectionTimeout(5);
            if (!props.getUsername().isEmpty()) {
                opts.setUserName(props.getUsername());
                opts.setPassword(props.getPassword().toCharArray());
            }
            client.connect(opts);
            log.info("MQTT conectado em {} ({} produtos mapeados)", props.getBrokerUrl(), mapping.size());
        } catch (MqttException ex) {
            log.warn("Falha ao conectar no broker MQTT ({}). Acionamentos do hardware serao ignorados.", ex.getMessage());
        }
    }

    @PreDestroy
    public void shutdown() {
        if (client != null && client.isConnected()) {
            try {
                client.disconnect();
                client.close();
            } catch (MqttException ignored) {
            }
        }
    }

    public Integer stationForTool(String toolName) {
        if (toolName == null || mapping == null) return null;
        return mapping.get(toolName);
    }

    public void triggerForToolNames(Collection<String> toolNames) {
        if (toolNames == null) return;
        Set<Integer> stations = new LinkedHashSet<>();
        for (String name : toolNames) {
            Integer station = stationForTool(name);
            if (station != null) stations.add(station);
        }
        for (Integer station : stations) {
            triggerStation(station);
        }
    }

    public void triggerStation(int station) {
        if (!isConnected()) {
            log.debug("MQTT nao conectado. Ignorando estacao {}.", station);
            return;
        }
        String topic = props.getStationTopicPrefix() + station;
        MqttMessage msg = new MqttMessage(String.valueOf(props.getPulseDurationMs()).getBytes());
        msg.setQos(1);
        msg.setRetained(false);
        try {
            client.publish(topic, msg);
            log.info("MQTT -> {} ({} ms)", topic, props.getPulseDurationMs());
        } catch (MqttException ex) {
            log.warn("Falha ao publicar em {}: {}", topic, ex.getMessage());
        }
    }

    public boolean isConnected() {
        return client != null && client.isConnected();
    }
}
