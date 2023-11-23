const express = require('express');
const { createServer } = require('http');
const { Server } = require("socket.io");
const loadMap = require('./mapLoader');

const app = express();
const httpServer = createServer(app);
const port = 5000;

async function main() { 

    const map2D = await loadMap();
    
    const io = new Server(httpServer, {
        cors: {
            origin:"http://localhost:5173"
        }
    });
    
    io.on("connect", (socket) => {
        console.log('user connected', socket.id);
        socket.emit('map', map2D);
    });
    
    httpServer.listen(port, () => {
        date = new Date()
        console.log(`Server Started on port ${port} at ${date}`);
    });
}

main();