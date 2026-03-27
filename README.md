# StreamFlow – Real-Time Basic Event Streaming Platform

A professional, application-oriented Kafka project using Node.js, Zookeeper, and Docker for real-time event streaming.

---

## Overview

StreamFlow is a lightweight event-driven system where services communicate via Kafka. It demonstrates:

* Running Kafka & Zookeeper using Docker
* Creating Kafka topics
* Producing messages from Node.js
* Consuming messages in Node.js
* Real-time event-driven architecture

---

## Tech Stack

* Node.js
* Apache Kafka
* Zookeeper
* Docker & Docker Compose
* KafkaJS library

---
## Architecture
```mermaid
flowchart LR
    classDef producer fill:#1a1a2e,stroke:#e94560,stroke-width:2px,color:#ffffff
    classDef kafka fill:#0f3460,stroke:#16213e,stroke-width:2px,color:#ffffff
    classDef consumer fill:#16213e,stroke:#0f3460,stroke-width:2px,color:#e0e0e0
    classDef output fill:#1b4332,stroke:#40916c,stroke-width:2px,color:#d8f3dc
    classDef zookeeper fill:#3d1a78,stroke:#7b2fff,stroke-width:2px,color:#e9d5ff
    classDef topic fill:#7c2d12,stroke:#ea580c,stroke-width:2px,color:#fed7aa

    ZK["🐘 Zookeeper\n:2181\nCluster Coordinator"]

    subgraph DOCKER["🐳 Docker Network"]
        direction LR

        subgraph KAFKA_CLUSTER["⚡ Kafka Cluster  |  Port 9092"]
            direction TB
            ZK
            K["📨 Kafka Broker\nID: 1  |  localhost:9092\nKafkaJS Client"]
            T1["📌 Topic: user-events\nPartitions: 1  |  Replication: 1"]
            T2["📌 Topic: notifications\nPartitions: 1  |  Replication: 1"]
            T3["📌 Topic: logs\nPartitions: 1  |  Replication: 1"]
            ZK -->|"coordinates"| K
            K --> T1
            K --> T2
            K --> T3
        end

        subgraph PRODUCER["🚀 Producer Layer"]
            P["⚙️ eventProducer.js\nNode.js  |  group: streamflow-app\nEmits every 3s: USER_LOGIN"]
        end

        subgraph CONSUMERS["🎯 Consumer Layer"]
            C1["🔔 notificationConsumer.js\nNode.js  |  group: notification-group\nSubscribes: user-events"]
            C2["📋 loggingConsumer.js\nNode.js  |  group: logging-group\nSubscribes: user-events"]
        end
    end

    subgraph OUTPUTS["📤 Outputs"]
        O1["💬 Notification Output\nJSON: message + timestamp"]
        O2["🖥️ Console Logs\nStructured Event Log"]
    end

    P -->|"produce\nuser-events"| T1
    T1 -->|"consume\nfan-out"| C1
    T1 -->|"consume\nfan-out"| C2
    C1 -->|"re-produce\nnotifications"| T2
    C2 -->|"write log"| O2
    T2 -->|"consume"| O1

    class P producer
    class K kafka
    class T1,T2,T3 topic
    class C1,C2 consumer
    class O1,O2 output
    class ZK zookeeper
```
---

## Project Structure

```
streamflow/
│
├── docker-compose.yml
├── .env
├── package.json
│
├── config/
│   └── kafka.js
│
├── producer/
│   └── eventProducer.js
│
├── consumer/
│   ├── notificationConsumer.js
│   └── loggingConsumer.js
│
├── topics/
│   └── createTopics.js
│
├── utils/
│   └── logger.js
│
└── README.md
```

---

## Prerequisites

Make sure you have installed:

* Docker Desktop (running)
* Node.js (v14+ recommended)
* npm

Verify installation:

```powershell
docker --version
node -v
npm -v
```

---

## Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3'

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    container_name: zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:latest
    container_name: kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

---

## Environment Variables

Create `.env`:

```
KAFKA_BROKER=localhost:9092
```

---

## Node.js Setup

Initialize project and install dependencies:

```powershell
npm init -y
npm install kafkajs dotenv
```

---

## Kafka Configuration

`config/kafka.js`:

```javascript
const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
    clientId: 'streamflow-app',
    brokers: [process.env.KAFKA_BROKER]
});

module.exports = kafka;
```

---

## Create Topics

`topics/createTopics.js`:

```javascript
const kafka = require('../config/kafka');

async function createTopics() {
    const admin = kafka.admin();
    await admin.connect();

    await admin.createTopics({
        topics: [
            { topic: 'user-events', numPartitions: 1 },
            { topic: 'notifications', numPartitions: 1 },
            { topic: 'logs', numPartitions: 1 }
        ]
    });

    console.log('Topics created');
    await admin.disconnect();
}

createTopics();
```

---

## Producer: eventProducer.js

`producer/eventProducer.js`:

```javascript
const kafka = require('../config/kafka');

const producer = kafka.producer();

async function run() {
    await producer.connect();

    let count = 0;

    setInterval(async () => {
        const event = {
            id: count++,
            type: 'USER_LOGIN',
            user: `user_${count}`,
            timestamp: new Date().toISOString()
        };

        await producer.send({
            topic: 'user-events',
            messages: [{ value: JSON.stringify(event) }]
        });

        console.log('Produced:', event);
    }, 3000);
}

run();
```

---

## Consumer: notificationConsumer.js

`consumer/notificationConsumer.js`:

```javascript
const kafka = require('../config/kafka');

const consumer = kafka.consumer({ groupId: 'notification-group' });
const producer = kafka.producer();

async function run() {
    await consumer.connect();
    await producer.connect();

    await consumer.subscribe({ topic: 'user-events' });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value.toString());

            const notification = {
                message: `User ${event.user} logged in`,
                time: event.timestamp
            };

            await producer.send({
                topic: 'notifications',
                messages: [{ value: JSON.stringify(notification) }]
            });

            console.log('Notification created:', notification);
        }
    });
}

run();
```

---

## Consumer: loggingConsumer.js

`consumer/loggingConsumer.js`:

```javascript
const kafka = require('../config/kafka');

const consumer = kafka.consumer({ groupId: 'logging-group' });

async function run() {
    await consumer.connect();

    await consumer.subscribe({ topic: 'user-events' });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value.toString());
            console.log('Log:', event);
        }
    });
}

run();
```

---

## Utility: Logger

`utils/logger.js`:

```javascript
function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

module.exports = log;
```
---

## Running the Project

```powershell
# Start Kafka and Zookeeper
docker-compose up -d

# Install Node.js dependencies
npm install

# Create Kafka topics
npm run create:topics

# Start services in separate terminals
npm run start:logging
npm run start:notification
npm run start:producer
```

---

## Notes

* Default Kafka port: 9092
* Zookeeper port: 2181
* Ensure Docker is running before starting services
* KafkaJS is production-ready, `kafkajs` is used instead of `kafka-node`

---

## Future Improvements

* Add Express API → Kafka pipeline
* Add React dashboard (real-time UI)
* Integrate Redis caching
* Add PostgreSQL storage
* Implement multi-partition topics & consumer groups

---

## License

MIT License