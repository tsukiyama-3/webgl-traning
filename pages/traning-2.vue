<script setup lang="ts">
import { Application, Container, Graphics, RenderTexture } from "pixi.js";

const dotSize = 16;
const colNum = 32;
const rowNum = 32;
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

const fill = (dot: Dot, color: number, targetColor?: number) => {
  if (dot.graphics.tint !== targetColor) {
    return;
  }
  if (dot.graphics.tint === color) {
    return;
  }
  dot.graphics.tint = color;
  dot.color = color;

  const neighbors = [
    dots.value.find((d) => d.x === dot.x - 1 && d.y === dot.y),
    dots.value.find((d) => d.x === dot.x + 1 && d.y === dot.y),
    dots.value.find((d) => d.x === dot.x && d.y === dot.y - 1),
    dots.value.find((d) => d.x === dot.x && d.y === dot.y + 1),
  ];

  for (const neighbor of neighbors) {
    if (neighbor && neighbor.graphics.tint === targetColor) {
      fill(neighbor, color, targetColor);
    }
  }
};

const createEditor = () => {
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
      dot.graphics.lineStyle(2, 0xdddddd);
      dot.graphics.drawRect(dot.x * dotSize, dot.y * dotSize, dotSize, dotSize);
      dot.graphics.endFill();
      editor.addChild(dot.graphics);
      dot.graphics.interactive = true;
    }
  }
};

const visibleGrid = ref(true);
const useGrid = () => {
  visibleGrid.value = !visibleGrid.value;
  if (visibleGrid.value) {
    dots.value.map((dot) => {
      dot.graphics.lineStyle(2, 0xdddddd);
      dot.graphics.drawRect(dot.x * dotSize, dot.y * dotSize, dotSize, dotSize);
    });
  } else {
    dots.value.map((dot) => {
      dot.graphics.lineStyle(2, 0xffffff);
      dot.graphics.drawRect(dot.x * dotSize, dot.y * dotSize, dotSize, dotSize);
    });
  }
};

const dragFlug = ref(false);

const draw = (e: any) => {
  if (dragFlug.value) {
    const offsetX = e.global.x - editor.position.x;
    const offsetY = e.global.y - editor.position.y;
    const x = Math.floor(offsetX / dotSize);
    const y = Math.floor(offsetY / dotSize);
    const dot = dots.value.find((dot) => dot.x === x && dot.y === y);
    if (dot) {
      dot.graphics.tint = currentColor.value;
    }
  }
};

const pointerdown = (e: any) => {
  dragFlug.value = true;
  const offsetX = e.global.x - editor.position.x;
  const offsetY = e.global.y - editor.position.y;
  const x = Math.floor(offsetX / dotSize);
  const y = Math.floor(offsetY / dotSize);
  const dot = dots.value.find((dot) => dot.x === x && dot.y === y);
  if (dot) {
    if (mode.value === "fill") {
      const startTime = performance.now();
      fill(dot, currentColor.value, dot.graphics.tint);
      const endTime = performance.now();
      console.log(`fill実行時間: ${endTime - startTime} ミリ秒`);
    } else if (mode.value === "pen") {
      draw(e);
    }
  }
};

const createImg = () => {};

editor
  .on("pointerdown", pointerdown)
  .on("pointermove", draw)
  .on("pointerup", () => (dragFlug.value = false));

const mode = ref("pen");

const renderer = ref()

onMounted(async () => {
  const app = new Application({
    backgroundColor: 0x2c3e50,
    width: 512,
    height: 512,
  });
  document.body.appendChild(app.view);

  document.body.addEventListener("keydown", (event) => {
    if (event.shiftKey && event.key === "G") {
      useGrid();
    }
    if (event.key === "p") {
      mode.value = "pen";
    }
    if (event.key === "f") {
      mode.value = "fill";
    }
  });

  createEditor();

  app.stage.addChild(editor);

  renderer.value = app.renderer
});

const dataURL = ref()

const completeImg = () => {
  const canvas = renderer.value.plugins.extract.canvas(editor)
  dataURL.value = canvas.toDataURL();
}

</script>

<template>
  <div>
    <input type="color" v-model="currentColor" />
    <input id="grid" type="checkbox" @change="useGrid" :checked="visibleGrid" />
    <label for="grid">Grid</label>
    <input
      type="radio"
      name="mode"
      value="pen"
      id="pen"
      v-model="mode"
      checked
    />
    <label for="pen">Pen</label>
    <input type="radio" name="mode" value="fill" id="fill" v-model="mode" />
    <label for="fill">Fill</label>
    <button @click="completeImg">complete</button>
    <a :href="dataURL" download="hoge.png">download</a>
  </div>
</template>
