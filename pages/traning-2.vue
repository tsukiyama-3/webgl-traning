<script setup lang="ts">
import {
  mdiPencil,
  mdiFormatColorFill,
  mdiGridLarge,
  mdiDownload,
} from "@mdi/js";
import { Application, Container, Graphics } from "pixi.js";

const dotSize = 16;
const colNum = 32;
const rowNum = 32;
const currentColor = ref(0x000000);

// zoom
const scale = ref(1);
const zoomSpeed = 0.001;
const maxScale = 2;
const minScale = 1;

type Dot = {
  x: number;
  y: number;
  graphics: Graphics;
};

const dots = ref<Dot[]>([]);

const editor = new Container();
editor.x = 0;
editor.y = 0;
editor.width = dotSize * colNum;
editor.height = dotSize * rowNum;
editor.interactive = true;

const fill = (dot: Dot, color: number, targetColor?: number) => {
  if (dot.graphics.tint !== targetColor) {
    return;
  }
  if (dot.graphics.tint === color) {
    return;
  }
  dot.graphics.tint = color;

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
        graphics: new Graphics(),
      };
      dots.value.push(dot);
      dot.graphics.beginFill(dot.graphics.tint);
      dot.graphics.lineStyle(1, 0xdddddd, 1, 0, false);
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
      dot.graphics.lineStyle(1, 0xdddddd, 1, 0, false);
      dot.graphics.drawRect(dot.x * dotSize, dot.y * dotSize, dotSize, dotSize);
    });
  } else {
    dots.value.map((dot) => {
      dot.graphics.lineStyle(1, 0xffffff, 1, 0, false);
      dot.graphics.drawRect(dot.x * dotSize, dot.y * dotSize, dotSize, dotSize);
    });
  }
};

const dragFlug = ref(false);

const draw = (e: any) => {
  if (dragFlug.value) {
    const offsetX = e.global.x - editor.position.x;
    const offsetY = e.global.y - editor.position.y;
    const x = Math.floor(offsetX / (dotSize * scale.value));
    const y = Math.floor(offsetY / (dotSize * scale.value));
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
  const x = Math.floor(offsetX / (dotSize * scale.value));
  const y = Math.floor(offsetY / (dotSize * scale.value));
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

editor.on("pointerdown", pointerdown).on("pointermove", draw);

const mode = ref("pen");

const renderer = ref();
const downloadImg = () => {
  const canvas = renderer.value.plugins.extract.canvas(editor);
  const link = document.createElement("a");
  link.download = "image.png";
  link.href = canvas.toDataURL();
  link.click();
};

// state

const saveState = () => {
  // state.value.push(JSON.stringify(dots.value));
  // console.log(JSON.stringify(dots.value));
};

// undo
const undoState = () => {};

watchEffect(() => {
  if (dragFlug.value === false) {
    saveState();
  }
});

// key down
const keydown = (e) => {
  if (e.shiftKey && e.key === "G") {
    useGrid();
  }
  if (e.key === "p") {
    mode.value = "pen";
  }
  if (e.key === "f") {
    mode.value = "fill";
  }
  if (e.key === "ArrowUp") {
    editor.y -= dotSize;
  }
  if (e.key === "ArrowDown") {
    editor.y += dotSize;
  }
  if (e.key === "ArrowLeft") {
    editor.x -= dotSize;
  }
  if (e.key === "ArrowRight") {
    editor.x += dotSize;
  }
};

onMounted(() => {
  const app = new Application({
    backgroundColor: 0x2c3e50,
    width: dotSize * colNum,
    height: dotSize * rowNum,
  });

  const canvasContainer = document.getElementById("canvas");
  canvasContainer.appendChild(app.view);

  document.body.addEventListener("pointerup", () => (dragFlug.value = false));

  document.body.addEventListener("keydown", keydown);

  renderer.value = app.renderer;

  editor.addEventListener("wheel", (e) => {
    scale.value += e.deltaY * -zoomSpeed;
    scale.value = Math.max(Math.min(scale.value, maxScale), minScale);
    editor.scale.x = scale.value;
    editor.scale.y = scale.value;
  });

  createEditor();

  app.stage.addChild(editor);
});
</script>

<template>
  <div class="container">
    <div
      id="canvas"
      :class="{ pen: mode === 'pen', fill: mode === 'fill' }"
    ></div>
    <div>
      <input type="color" v-model="currentColor" />
      <input
        id="grid"
        type="checkbox"
        @change="useGrid"
        :checked="visibleGrid"
      />
      <label for="grid" class="label" :class="{ 'active-bg': visibleGrid }">
        <VIcon
          :icon="mdiGridLarge"
          size="36"
          :class="{ active: visibleGrid }"
        />
      </label>
      <input
        type="radio"
        name="mode"
        value="pen"
        id="pen"
        v-model="mode"
        checked
      />
      <input type="radio" name="mode" value="fill" id="fill" v-model="mode" />
      <div class="mode-block">
        <label for="pen" class="label" :class="{ 'active-bg': mode === 'pen' }">
          <VIcon
            :icon="mdiPencil"
            size="36"
            :class="{ active: mode === 'pen' }"
          />
        </label>
        <label
          for="fill"
          class="label"
          :class="{ 'active-bg': mode === 'fill' }"
        >
          <VIcon
            :icon="mdiFormatColorFill"
            size="36"
            :class="{ active: mode === 'fill' }"
          />
        </label>
      </div>
      <button @click="downloadImg">
        <VIcon :icon="mdiDownload" size="36" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.mt-1 {
  margin-top: 8px;
}

.container {
  display: flex;
  justify-content: center;
  column-gap: 2rem;
}

input[type="radio"] {
  display: none;
  -webkit-appearance: none;
  display: block;
  margin: 0;
}

input[type="checkbox"] {
  -webkit-appearance: none;
  display: block;
}

input[type="color"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  display: block;
  margin: 0;
  width: 54px;
  height: 60px;
  padding: 0;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

input[type="color"]::-webkit-color-swatch {
  border-radius: 50%;
  border: 2px solid #dddddd;
}

input[type="color"]::-moz-color-swatch {
  border-radius: 50%;
  border: 2px solid #dddddd;
}

button {
  color: #1166dd;
  border: 2px solid #1166dd;
  display: inline-flex;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background-color: #ffffff;
  cursor: pointer;
}

.active {
  color: #fffffe;
}

.pen {
  cursor: url("assets/pencil.svg") 4 12, default;
}

.fill {
  cursor: url("assets/fill.svg") 4 12, default;
}

.active-bg {
  background-color: #1166dd;
}

.mode-block {
  display: flex;
  column-gap: 8px;
  margin-bottom: 8px;
  margin-top: 8px;
}

.label {
  color: #1166dd;
  border: 2px solid #1166dd;
  display: inline-flex;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
}
</style>
