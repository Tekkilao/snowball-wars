<script setup>
  import { io } from "socket.io-client";
  import { onMounted } from "vue";


    onMounted( () => {
      const mapImage = new Image();
      mapImage.src = 'src/assets/snowy-sheet.png';
      const santaImage = new Image();
      santaImage.src = 'src/assets/santa.png'

      const canvasEl = document.getElementById('canvas');
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
      const canvas = canvasEl.getContext("2d");
      const socket = io("ws://localhost:5000");
      const walkSnow = new Audio('src/assets/walk-snow.mp3');

      let groundMap = [[]];
      let decalMap = [[]];
      let players = [];
      let snowballs = [];
      

      const TILE_SIZE = 32;
      const SNOWBALL_RADIUS = 5;


      socket.on('connect', () => {
      });

      socket.on('map', (loadedMap) => {
        groundMap = loadedMap.ground;
        decalMap = loadedMap.decal;
      });
      
      socket.on('players', (serverPlayers) => {
        players = serverPlayers;
      })

      socket.on("snowballs", (serverSnowballs) => {
        snowballs = serverSnowballs;
      });


      const inputs = {
        up: false,
        down: false,
        right: false,
        left: false
      }

      window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        
        switch(key) {
          case "w": 
            inputs['up'] = true;
            break;
          case "s": 
            inputs['down'] = true;
            break;
          case "d":
            inputs['right'] = true;
            break;
          case "a": 
            inputs['left'] = true;
            break;
        }
        if (["a", "s", "w", "d"].includes(e.key) && walkSnow.paused) {
            // walkSnow.play(); <- need fix, sounds laggy
        }
        socket.emit('inputs', inputs);
      

      })
      window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        switch(key) {
          case "w": 
            inputs['up'] = false;
            break;
          case "s": 
            inputs['down'] = false;
            break;
          case "d":
            inputs['right'] = false;
            break;
          case "a": 
            inputs['left'] = false;
            break;
        }
        if (["a", "s", "w", "d"].includes(e.key)) {
          walkSnow.pause();
          walkSnow.currentTime = 0;
        }
        socket.emit('inputs', inputs);

      })
      window.addEventListener('click', (e) => {
        const player = players.find((player) => player.id === socket.id);
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const angle = Math.atan2(mouseY - canvasEl.height / 2, mouseX - canvasEl.width / 2);
        socket.emit("snowball", angle);
      })


      function loop() {
        canvas.clearRect(0, 0, canvasEl.width, canvasEl.height);
        const TILES_IN_ROW = 8;
        const myPlayer = players.find((player) => player.id === socket.id);
        let cameraX = 0;
        let cameraY = 0;
        if (myPlayer) {
          cameraX = parseInt(myPlayer.x - canvasEl.width / 2);
          cameraY = parseInt(myPlayer.y - canvasEl.height / 2);
        }


        for (let row = 0; row < groundMap.length; row++){
          for (let col = 0; col < groundMap[0].length; col++){
            const { id } = groundMap[row][col];
            const imageRow = parseInt(id / TILES_IN_ROW);
            const imageCol = id % TILES_IN_ROW;
            canvas.drawImage(
            mapImage,
            imageCol * TILE_SIZE,
            imageRow * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE,
            col * TILE_SIZE - cameraX,
            row * TILE_SIZE - cameraY,
            TILE_SIZE,
            TILE_SIZE
            );

          }
        };
          for (let row = 0; row < decalMap.length; row++) {
            for (let col = 0; col < decalMap[0].length; col++) {
              let { id } = decalMap[row][col] ?? { id: undefined };
              const imageRow = parseInt(id / TILES_IN_ROW);
              const imageCol = id % TILES_IN_ROW;

              canvas.drawImage(
                mapImage,
                imageCol * TILE_SIZE,
                imageRow * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE,
                col * TILE_SIZE - cameraX,
                row * TILE_SIZE - cameraY,
                TILE_SIZE,
                TILE_SIZE
              );
            }
          }

        for (const player of players) {
        canvas.drawImage(santaImage, player.x - cameraX, player.y - cameraY);
        };
        
        for (const snowball of snowballs) {
          canvas.fillStyle = "#FFFFFF"
          canvas.beginPath();
          canvas.arc(snowball.x - cameraX, snowball.y - cameraY, SNOWBALL_RADIUS, 0, 2 * Math.PI);
          canvas.fill()
        }
        
        window.requestAnimationFrame(loop);
      }
      window.requestAnimationFrame(loop);
    });




</script> 

<template>
  <div>
    <canvas id="canvas"></canvas>
  </div>
</template>
