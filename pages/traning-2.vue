<script setup lang="ts">
import { Application, Assets, Sprite, Container, Graphics } from "pixi.js";

const dotSize = 8;
const colNum = 64;
const rowNum = 64;
const currentColor = ref(0x000000);

type Dot = {
  x: number;
  y: number;
  color: number;
  graphics: Graphics;
};

const dots = ref<Dot[]>([]);

const editor = new Container();
editor.x = 0;
editor.y = 0;
editor.width = 512;
editor.height = 512;
editor.interactive = true;

onMounted(() => {
  const app = new Application({
    backgroundColor: 0x2c3e50,
  });
  document.body.appendChild(app.view);

  for (let c = 0; c < colNum; c++) {
    for (let r = 0; r < rowNum; r++) {
      const dot: Dot = {
        x: c,
        y: r,
        color: 0xffffff,
        graphics: new Graphics(),
      };
      dots.value.push(dot);
      dot.graphics.beginFill(dot.color);
      dot.graphics.drawRect(dot.x * dotSize, dot.y * dotSize, dotSize, dotSize);
      dot.graphics.endFill();
      editor.addChild(dot.graphics);
      dot.graphics.interactive = true;
    }
  }

  editor.on("pointerdown", (e) => {
    const offsetX = e.global.x - editor.position.x;
    const offsetY = e.global.y - editor.position.y;
    const x = Math.floor(offsetX / dotSize);
    const y = Math.floor(offsetY / dotSize);
    const dot = dots.value.find((dot) => dot.x === x && dot.y === y);
    if (dot) {
      dot.graphics.tint = currentColor.value;
    }
  });

  app.stage.addChild(editor);
});
</script>

<template>
  <div>
    <input type="color" v-model="currentColor" />
  </div>
</template>
