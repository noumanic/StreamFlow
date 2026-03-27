const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const kafka = require('../config/kafka');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const consumer = kafka.consumer({ groupId: 'websocket-bridge' });

async function run() {
    await consumer.connect();
    await consumer.subscribe({ topics: ['user-events', 'analytics', 'notifications'], fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            const data = JSON.parse(message.value.toString());
            // Broadcast to all connected clients
            io.emit('kafka-event', {
                topic,
                payload: data,
                timestamp: new Date().toISOString()
            });
            console.log(`[WS Bridge] Emitted event from ${topic}`);
        }
    });

    const PORT = process.env.BRIDGE_PORT || 3001;
    
    app.get('/health', (req, res) => {
        res.json({ status: 'up', kafka: 'connected', timestamp: new Date().toISOString() });
    });

    server.listen(PORT, () => {
        console.log(`WebSocket Bridge running on port ${PORT}`);
    });
}

run().catch(console.error);
