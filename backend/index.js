const express = require('express');
const { createServer } = require('http');
const { Server } = require("socket.io");
const loadMap = require('./mapLoader');

const app = express();
const httpServer = createServer(app);
const port = 5000;

const io = new Server(httpServer, {
    cors: {
        origin:"http://localhost:5173"
    }
});

const TICK_RATE = 64;

const SPEED = 5;
const SNOWBALL_SPEED = 7;
const PLAYER_SIZE = 32;

let players = [];
let snowballs = [];
const inputsMap = {};


function tick(delta) {
    for(const player of players) {
        const inputs = inputsMap[player.id];
        // switch (inputs) {
        //     // case inputs.up: 
        //     //     player.y -= SPEED;
        //     // case inputs.down:
        //     //     player.y += SPEED;
        //     // case inputs.left:
        //     //     player.x -= SPEED;
        //     case inputs.right == true: 
        //         player.x = 0
        //         console.log('lixo')
        //         break;

        // }
        if (inputs.up) {
            player.y -= SPEED;
        } else if (inputs.down) {
            player.y += SPEED;
        } else if (inputs.left) {
            player.x -= SPEED;
        } else if (inputs.right) {
            player.x += SPEED;
        }
    }
    for (const snowball of snowballs) {
        snowball.x += Math.cos(snowball.angle) * SNOWBALL_SPEED;
        snowball.y += Math.sin(snowball.angle) * SNOWBALL_SPEED;
        snowball.timeLeft -= delta;

        for (const player of players)
        {
            if (player.id === snowball.playerId) continue;
            const distance = Math.sqrt((player.x + PLAYER_SIZE / 2 - snowball.x) ** 2 + (player.y + PLAYER_SIZE / 2 - snowball.y) ** 2);
            if (distance <= PLAYER_SIZE / 2) 
            {
                player.x = 0;
                player.y = 0;
                snowball.timeLeft = -1;
                break;
            }
        }
    }

    
    snowballs = snowballs.filter((snowball) => snowball.timeLeft > 0);

    io.emit('players', players);    
    io.emit("snowballs", snowballs);

};

// for (const snowball of snowballs) {
//     snowball.x += Math.cos(snowball.angle) * SNOWBALL_SPEED;
//     snowball.y += Math.sin(snowball.angle) * SNOWBALL_SPEED;
// }


async function main() { 
    const map2D = await loadMap();

    io.on("connect", (socket) => {
        console.log('user connected', socket.id);

        inputsMap[socket.id] = {
            up: false,
            down: false,
            right: false,
            left: false
        };

        players.push({
            id: socket.id,
            x: 800, 
            y: 800,
        });        

        socket.emit('map', map2D);

        socket.on('inputs', (inputs) => {
            inputsMap[socket.id] = inputs;
        });
        
        socket.on('snowball', (angle) => {
            const player = players.find(player => player.id === socket.id);
            snowballs.push({
                angle,
                x: player.x,
                y: player.y,
                timeLeft: 4000,
                playerId: socket.id, 
            })
        })

        socket.on('disconnect', () => {
            players = players.filter((player) => player.id !== socket.id);
            // setInterval(() => {
            //     players = players.filter((player) => player.id !== socket.id);
            // }, 60000);
        });
    });
    
    httpServer.listen(port, () => {
        date = new Date()
        console.log(`Server Started on port ${port} at ${date}`);
    });

    let lastUpdate = Date.now();

    setInterval(() => {
        const now = Date.now();
        const delta = now - lastUpdate;
        tick(delta);
        lastUpdate = now;
    }, 1000 / TICK_RATE);
    
}

main();