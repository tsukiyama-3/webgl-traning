<script setup lang="ts">
import { Application, Assets, Sprite, Container, Graphics } from "pixi.js";

const dotSize = 8;
const colNum = 64;
const rowNum = 64;
const crruentColor = ref(0x000000);

type Dot = {
  x: number;
  y: number;
  color: number;
};

const dots = ref<any>([]);
for (let c = 0; c < colNum; c++) {
  for (let r = 0; r < rowNum; r++) {
    dots.value.push({
      x: c,
      y: r,
      color: 0xffffff,
    });
  }
}

const editor = new Container();
editor.x = 0;
editor.y = 0;
editor.width = 512;
editor.height = 512;

editor.interactive = true;

const drawColor = (dots: any) => {
  dots.map((dot: any) => {
    const graphics = new Graphics();
    graphics.beginFill(dot.color);
    graphics.drawRect(dot.x * 8, dot.y * 8, 8, 8);
    graphics.endFill();
    editor.addChild(graphics);
    dot.interactive = true
  });
};

onMounted(async () => {
  const PIXEL_RATIO = window.devicePixelRatio;
  const app = new Application({
    backgroundColor: 0x2c3e50,
  });
  document.body.appendChild(app.view);

  editor.on("pointerdown", (e) => {
    const offsetX = e.global.x - editor.position.x;
    const offsetY = e.global.y - editor.position.y;
    const x = Math.floor((offsetX / dotSize) * PIXEL_RATIO);
    const y = Math.floor((offsetY / dotSize) * PIXEL_RATIO);
    for (let i = 0; i < colNum * rowNum; i++) {
      if (dots.value[i].x === x && dots.value[i].y === y) {
        dots.value[i].color = crruentColor.value;
      }
    }
    drawColor(dots.value);
  });

  app.stage.addChild(editor);

  drawColor(dots.value);
});
</script>

<template>
  <div>
    <input type="color" v-model="crruentColor" />
  </div>
</template>
