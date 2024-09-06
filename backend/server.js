const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { runSecurityCheck } = require('./utility/runSecurityCheck'); // Import the runSecurityCheck function

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve the frontend (if needed)
app.use(express.static('public'));

// WebSocket Connection
wss.on('connection', (ws) => {
    console.log('WebSocket connection established');

    // Listen for messages from the client
    ws.on('message', (message) => {
        try {
            const { url } = JSON.parse(message); // Expecting a URL in the message
            if (!url) {
                ws.send(JSON.stringify({ error: 'No URL provided' }));
                return;
            }

            // Create a progress map to track the steps
            const progressMap = {
                sslCheck: false,
                xssCheck: false,
                securityHeadersCheck: false,
                cspCheck: false,
                portScanCheck: false,
                sqlInjectionCheck: false,
                dnsCheck: false,
                subdomainCheck: false,
                directoryScanCheck: false,
                cookieCheck: false
            };

            // Call the runSecurityCheck function with the URL, progress map, and WebSocket
            runSecurityCheck(url, progressMap, ws);
        } catch (error) {
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
    });

    // Handle WebSocket disconnection
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
