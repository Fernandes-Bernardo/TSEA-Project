import sys
import paho.mqtt.client as mqtt

BROKER = "broker.hivemq.com"
PORT = 1883
TOPIC = "servo/#"


def on_connect(client, userdata, flags, rc):
    print(f"SNIFFER conectado rc={rc}, assinando {TOPIC}", flush=True)
    client.subscribe(TOPIC, qos=1)


def on_message(client, userdata, msg):
    print(f"MSG {msg.topic} = {msg.payload.decode(errors='replace')}", flush=True)


c = mqtt.Client(client_id="zaiko-sniffer")
c.on_connect = on_connect
c.on_message = on_message
c.connect(BROKER, PORT, 30)
c.loop_forever()
