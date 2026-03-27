# StreamFlow – Professional Data Engineering Pipeline 🚀

StreamFlow is a event streaming platform designed to demonstrate the complete **Data Engineering Lifecycle**. It transitions from simple message passing to a managed, resilient ecosystem following industry best practices.

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    %% --- Master Theme & Precision Styling ---
    accTitle: StreamFlow Master-Level System Architecture
    accDescr: An exhaustive mapping of the end-to-end Data Engineering ecosystem.

    classDef default fill:#0f172a,stroke:#334155,stroke-width:1px,color:#cbd5e1;
    classDef producer fill:#020617,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef kafka fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef processing fill:#0f172a,stroke:#6366f1,stroke-width:2px,color:#fff;
    classDef storage fill:#020617,stroke:#ef4444,stroke-width:2px,color:#fff;
    classDef frontend fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef network fill:#0f172a,stroke:#64748b,stroke-dasharray: 4 4,color:#94a3b8;
    classDef init fill:#111827,stroke:#9ca3af,stroke-width:1px,color:#9ca3af,stroke-dasharray: 2 2;

    %% --- Layer 1: Ingestion Ecosystem ---
    subgraph INGEST ["🚀 INGESTION LAYER (NODE.JS 20)"]
        direction LR
        P1["⚙️ eventProducer.js\nMath.random() Distribution\n3s Intermittent Emission"]
        P1 --> P2["🛡️ security.js\nSHA-256 PII Redaction\nMasked: {user_email}"]
    end

    %% --- Layer 2: Transport (Broker) ---
    subgraph BROKER ["⚡ PERSISTENT DATA BUS (APACHE KAFKA)"]
        direction TB
        ZK["🐘 Zookeeper\nCluster Coordination\nPort: 2181 / 2888 / 3888"]
        K1["📨 Kafka Broker v7.5\nPLAINTEXT: 9092\nINTERNAL: 29092"]
        
        INIT["🏗️ init-kafka (InitContainer)\nExec: createTopics.js\nCreates Paritions & Specs"]

        subgraph TOPICS ["📁 TOPIC REGISTRY"]
            T1["📌 user-events\nPartitions: 3\nReten: 168h"]
            T2["📌 analytics\nAggregated Telemetry"]
            T3["📌 notifications\nVerified Data Objects"]
            T4["⚠️ dead-letter-topic\nFault Isolation (DLQ)"]
        end

        INIT -.->|Check Health| K1
        ZK -.->|Leader Election| K1
        K1 === T1 & T2 & T3 & T4
    end

    %% --- Layer 3: Transformation Workspace ---
    subgraph PROCESS ["🎯 TRANSFORMATION LAYER (DISTRIBUTED CONSUMERS)"]
        direction LR
        C1["📊 analyticsConsumer.js\nGroup: analytics-group\nWindow: 10s Tumbling"]
        C2["🔔 notificationConsumer.js\nGroup: notification-group\nZod Schema Enforcement"]
    end

    %% --- Layer 4: Persistence & Reliability ---
    subgraph SINK ["💾 PERSISTENCE & FAULT TOLERANCE"]
        direction TB
        DB_S["📥 dbConsumer.js\nGroup: db-group\nPostgreSQL Sink"]
        PG["🐘 PostgreSQL 15\nTable: 'events'\nInternal Port: 5432"]
        DLQ_S["❌ Error Observer\nSchema/JSON Fault\nPersistence to T4"]
    end

    %% --- Layer 5: Serving & Real-Time Observer ---
    subgraph SERVE ["🖥️ OBSERVABILITY COCKPIT (THE BRIDGE)"]
        direction TB
        WS["🌉 websocketBridge.js\nSocket.IO v4.8\nPort: 3001 | 1.2k req/s"]
        DASH["💎 React Dashboard\nVite 8 + Tailwind 4\nRecharts Gallery"]
    end

    %% --- Advanced Data Flow ---
    P2 ===>|"KAFKA_BROKER:29092"| T1
    
    T1 --->|"Stateful Map"| C1
    C1 --->|"Agg: LoginCount"| T2
    
    T1 --->|"Schema Validate"| C2
    C2 --"Success"--> T3
    C2 --"DLQ Redirect"--> T4
    
    T1 & T2 ---> DB_S
    DB_S ===>|"DATABASE_URL"| PG
    
    T3 & T4 ---> DLQ_S

    %% Critical Serving Logic
    T1 & T2 & T3 & T4 -.->|"Event Pipeline"| WS
    WS ===>|"Broadcasting\n'kafka-event'"| DASH

    %% --- Class Assignments ---
    class P1,P2 producer;
    class K1,T1,T2,T3,T4 kafka;
    class C1,C2 processing;
    class DB_S,PG,DLQ_S storage;
    class WS,DASH frontend;
    class INGEST,BROKER,PROCESS,SINK,SERVE network;
    class INIT init;
```

---

## 🧬 The Data Engineering Lifecycle (DELC) Implementation

StreamFlow implements the industry-standard **Data Engineering Lifecycle** with high-fidelity practices at every stage:

### 1. 🏗️ Generation (Source)
- **High-Velocity Simulation:** `eventProducer.js` generates standardized JSON login events.
- **Undercurrent: Security:** In-transit **Data Masking** (SHA-256) redacts sensitive `user_email` patterns before they enter the stream.

### 2. 📥 Ingestion
- **Resilient Transport:** Apache Kafka acts as the decoupled, durable intake buffer.
- **Architectural Scaling:** Configured with **3 Partitions** per topic to enable parallel ingestion and high-throughput ingestion.

### 3. ⚡ Transformation
- **Stateful Processing:** `analyticsConsumer.js` performs **Tumbling Window** aggregations (10s intervals).
- **Undercurrent: Data Management:** **Zod Schema Validation** creates a strict data contract; invalid payloads are routed to a **Dead Letter Queue (DLQ)**.

### 4. 💾 Storage
- **Relational Persistence:** `dbConsumer.js` sinks validated events into **PostgreSQL 15**.
- **Structured Schema:** Hardened table definitions ensure consistent historical data retrieval.

### 5. 🚀 Serving
- **Real-Time Delivery:** **WebSocket Bridge** (Socket.io) serves as the presentation layer.
- **Observability Cockpit:** A high-end **React Dashboard** provides live observability of the entire pipeline velocity.

---

## 🛠️ Tech Stack
- **Streaming:** Apache Kafka, Zookeeper
- **Backend:** Node.js, Express, Socket.io, KafkaJS
- **Frontend:** React, Vite, TailwindCSS v4, Recharts
- **Database:** PostgreSQL 15
- **Tools:** Docker, Jest, Zod, Framer-motion

---

## 📊 Visual Platform Walkthrough

### 💎 High-Density Operational Cockpit
The StreamFlow dashboard provides real-time throughput velocity, deep-payload inspection, and infrastructure health monitoring.
![Dashboard Screenshot](snapshots/dashboard_streamflow.png)

### ⚡ Kafka Infrastructure & Topic Management
Full visibility into the 3-partition scaling and message distribution via Kafka-UI.
![Kafka UI Topics](snapshots/kafka_ui_topics.png)
![Kafka UI Consumers](snapshots/kafka_ui_consumers.png)

### 🛰️ Real-Time Pipeline Terminals
Observation of the end-to-end data flow: Producer -> Analytics -> Bridge -> DB.
![Producer Terminal](snapshots/producer_terminal.png)
![Analytics Terminal](snapshots/analytics_terminal.png)
![DB Terminal](snapshots/streamflow_db_terminal.png)

---

## 🚀 Getting Started

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Launch Dashboard
```bash
cd dashboard && npm run dev
```

### 3. Start Pipeline
```bash
npm run create:topics
npm run start:producer
npm run start:analytics
npm run start:db
npm run start:bridge
```

---

## 🏗️ Detailed Micro-Architecture Specifications

To ensure the platform is enterprise-ready, the following precise network and service specifications are implemented:

| Component | Technology | Internal Port | External Port | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Broker** | Apache Kafka 7.5 | `29092` | `9092` | Distributed Event Log |
| **Coordinator** | Zookeeper | `2181` | - | Cluster State Manager |
| **Persistence** | PostgreSQL 15 | `5432` | `5432` | Historical Sink |
| **Bridge** | Express + Socket.IO | `3001` | `3001` | WebSocket Telemetry |
| **Dashboard** | React + Vite | `5173` | `5173` | Observability Cockpit |
| **Monitoring** | Kafka-UI | `8080` | `8080` | Cluster Management |

### 🛰️ Service Discovery & Orchestration
The environment uses a robust **Init-Container pattern**:
1.  **Stage 1:** `db` and `kafka` services initiate with health checks.
2.  **Stage 2:** `init-kafka` executes topic creation (3 Partitions) and waits for cluster availability.
3.  **Stage 3:** Operational microservices (`producer`, `analytics`, `bridge`, etc.) start only after Stage 2 success, preventing race conditions and partial failures.

---

### 📊 DataOps & Observability
- **Platform Health:** Automated service health checks and 24/7 Kafka monitoring via **Kafka-UI**.
- **Real-Time Telemetry:** Millisecond-latency tracking via the **Socket.IO Bridge** and **Payload Inspector**.

### 🛠️ DevOps & Infrastructure
- **Orchestration:** Fully containerized setup with **Docker Compose** managing the microservices mesh.
- **CI/CD:** **GitHub Actions** pipeline for automated build validation and regression testing.

### 🧪 Quality Assurance
- **Automated Testing:** Comprehensive **Jest** suite covering PII masking and Zod schema contracts.
- **Fault Isolation:** **Dead Letter Queue (DLQ)** prevents upstream data corruption.

---

## 📜 License
© 2026 MNH (@noumanic). Licensed under the MIT License.