import sys
import paho.mqtt.client as mqtt

BROKER = "broker.hivemq.com"
PORT = 1883

topic = sys.argv[1] if len(sys.argv) > 1 else "zaiko/servos"
payload = sys.argv[2] if len(sys.argv) > 2 else "5000"

c = mqtt.Client(client_id="zaiko-pub-test")
c.connect(BROKER, PORT, 30)
c.loop_start()
info = c.publish(topic, payload, qos=1)
info.wait_for_publish()
print(f"PUBLICADO {topic} = {payload}", flush=True)
c.loop_stop()
c.disconnect()
