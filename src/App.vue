<script setup>
  import { io } from "socket.io-client";
  import { onMounted } from "vue";
  const mapImage = new Image();
  mapImage.src = 'src/assets/snowy-sheet.png';

    onMounted( () => {
      const canvasEl = document.getElementById('canvas');
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
      const canvas = canvasEl.getContext("2d");
      const socket = io("ws://localhost:5000");

      let map = [[]];
      const TILE_SIZE = 16;

      socket.on('connect', () => {
      });

      socket.on('map', (loadedMap) => {
        map = loadedMap;
      });

      function loop() {
        canvas.clearRect(0, 0, canvas.width, canvas.height);
        const TILES_IN_ROW = 8;

        for (let row = 0; row < map.length; row++){
          for (let col = 0; col < map[0].length; col++){
            const { id } = map[row][col];
            const imageRow = parseInt(id / TILES_IN_ROW);
            const imageCol = id % TILES_IN_ROW;
            canvas.drawImage(mapImage,
            imageCol * TILE_SIZE,
            imageRow * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE,
            col * TILE_SIZE,
            row * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
            );
          }
        }

        canvas.fillStyle = '#ff0000';
        canvas.fillRect(0, 0, 10, 10);
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
