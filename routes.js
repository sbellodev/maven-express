const express = require("express");

const router = express.Router();
module.exports = (webSocketNotifier) => {
  router.ws('/api/michisocket/:userId', (ws, req) => {
    console.log('WebSocket connection established');

    const userId = req.params.userId; // Extract the user ID from the query

  // Add the WebSocket connection to the notifier
    webSocketNotifier.add(userId, ws);

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);

        // Handle incoming messages as needed
        webSocketNotifier.broadcast(message);
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        
        // Remove the connection from the notifier
        webSocketNotifier.remove(userId);
    });
});

  return router;
};