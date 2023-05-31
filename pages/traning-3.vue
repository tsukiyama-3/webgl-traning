<script setup lang="ts">
const canvas = ref();
const isClicked = ref(false);
const canvasSize = 64;
const dotSize = 8;
const coords = ref();
const currentColor = ref("#000000");
const mode = ref("pen");

const pixels = ref();

const previousCol = ref(0);
const previousRow = ref(0);

pixels.value = new Uint32Array(canvasSize * canvasSize);

const onCanvasMousemove = (event: MouseEvent) => {
  coords.value = getRelativeCoordinates(event.clientX, event.clientY);
  if (isClicked.value) {
    if (
      Math.abs(coords.value.x - previousCol.value) > 1 ||
      Math.abs(coords.value.y - previousRow.value) > 1
    ) {
      const interpolatedPixels = getLinePixels(coords.value.x, previousCol.value, coords.value.y, previousRow.value)
      for (let i = 0, l = interpolatedPixels.length; i < l; i++) {
        const coords = interpolatedPixels[i];
        drawAt(coords.col, coords.row);
      }
    } else {
      drawAt(coords.value.x, coords.value.y);
    }
    previousCol.value = coords.value.x
    previousRow.value = coords.value.y
  }
};

const onCanvasMousedown = (event: MouseEvent) => {
  isClicked.value = true;
  coords.value = getRelativeCoordinates(event.clientX, event.clientY);
  previousCol.value = coords.value.x;
  previousRow.value = coords.value.y;
  if (mode.value === "pen") {
    drawAt(coords.value.x, coords.value.y);
  } else if (mode.value === "bucket") {
    const startTime = performance.now();
    fillAt(coords.value.x, coords.value.y);
    const endTime = performance.now();
    console.log(`fill実行時間: ${endTime - startTime} ミリ秒`);
  }
};

const onCanvasMouseup = () => {
  isClicked.value = false;
};

// ピクセル座標を返す
const getRelativeCoordinates = (x: number, y: number) => {
  const canvasRect = canvas.value.getBoundingClientRect();
  return {
    x: Math.floor((x - canvasRect.left) / dotSize),
    y: Math.floor((y - canvasRect.top) / dotSize),
  };
};

const drawAt = (x: number, y: number) => {
  if (containsPixel(x, y)) {
    setPixelColor(x, y, colorToInt(currentColor.value));
    renderPixel();
  }
};

const fillAt = (x: number, y: number) => {
  if (containsPixel(x, y)) {
    const targetColor = getPixelColor(x, y);
    const startPixel = {
      col: x,
      row: y,
    };
    visitConnectedPixels(startPixel, (pixle: any) => {
      if (getPixelColor(pixle.col, pixle.row) === targetColor) {
        setPixelColor(pixle.col, pixle.row, colorToInt(currentColor.value));
        return true;
      } else {
        return false;
      }
    });
    renderPixel();
  }
};

// ピクセルを描画する
const renderPixel = () => {
  const context = canvas.value.getContext("2d");
  context.imageSmoothingEnabled = false;
  const offscreenCanvas = document.createElement("canvas");
  const offscreenContext = offscreenCanvas.getContext("2d");
  offscreenCanvas.width = canvasSize;
  offscreenCanvas.height = canvasSize;
  const imageData = offscreenContext?.createImageData(canvasSize, canvasSize);
  const imgDataData = imageData?.data;
  const data = new Uint8ClampedArray(pixels.value.buffer);
  imgDataData?.set(data);
  offscreenContext?.putImageData(imageData!, 0, 0);
  context.clearRect(0, 0, canvasSize, canvasSize);
  context.save();
  context.scale(dotSize, dotSize);
  context.drawImage(offscreenCanvas, 0, 0);
  context.restore();
};

// 隣接するピクセルを取得する
const visitConnectedPixels = (pixel: any, pixelVisitor: any) => {
  const queue = [];
  const visitedPixels = [];
  const dy = [-1, 0, 1, 0];
  const dx = [0, 1, 0, -1];
  queue.push(pixel);
  visitedPixels.push(pixel);
  pixelVisitor(pixel);

  const loopCount = ref(0);
  const cellCount = canvasSize * canvasSize;
  while (queue.length > 0) {
    loopCount.value++;
    const currentItem: any = queue.pop();
    for (let i = 0; i < 4; i++) {
      const nextCol = currentItem.col + dx[i];
      const nextRow = currentItem.row + dy[i];
      try {
        const connectedPixel = { col: nextCol, row: nextRow };
        const isValid = pixelVisitor(connectedPixel);
        if (isValid) {
          queue.push(connectedPixel);
          visitedPixels.push(connectedPixel);
        }
      } catch (e) {
        // Frame out of bound exception.
      }
    }
    // Security loop breaker:
    if (loopCount.value > 10 * cellCount) {
      console.log("loop breaker called");
      break;
    }
  }
  return visitedPixels;
};

// ピクセルカラーを取得する
const getPixelColor = (x: number, y: number) => {
  if (containsPixel(x, y)) {
    return pixels.value[y * canvasSize + x];
  } else {
    return null;
  }
};

// ピクセルカラーを設定する
const setPixelColor = (x: number, y: number, color: number) => {
  if (containsPixel(x, y)) {
    const index = y * canvasSize + x;
    pixels.value[index] = color;
  }
};

// キャンバスないか判定する
const containsPixel = (col: number, row: number) => {
  return col >= 0 && row >= 0 && col < canvasSize && row < canvasSize;
};

const getLinePixels = (x0: number, x1: number, y0: number, y1: number) => {
  const pixels = [];
  x1 = normalize(x1, 0);
  y1 = normalize(y1, 0);
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    pixels.push({ col: x0, row: y0 });
    if (x0 == x1 && y0 == y1) {
      break;
    }
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
  return pixels;
};

const normalize = (value: number, def: number) => {
  if (typeof value === 'undefined' || value === null) {
    return def;
  } else {
    return value;
  }
}

const colorToInt = (color: string) => {
  const hex = color.replace("#", "");
  const red = parseInt(hex.substr(0, 2), 16);
  const green = parseInt(hex.substr(2, 2), 16);
  const blue = parseInt(hex.substr(4, 2), 16);
  const alpha = 255;
  const colorInt = ((alpha << 24) >>> 0) + (blue << 16) + (green << 8) + red;
  return colorInt;
};
</script>

<template>
  <div
    style="background-color: #eee; padding-top: 100px"
    @mousemove="onCanvasMousemove"
    @mousedown="onCanvasMousedown"
    @mouseup="onCanvasMouseup"
  >
    <canvas
      ref="canvas"
      :width="512"
      :height="512"
      style="border: 1px solid #000"
    ></canvas>
  </div>
  <input type="color" v-model="currentColor" />
  <input type="radio" name="mode" value="bucket" id="bucket" v-model="mode" />
  <label for="bucket">bucket</label>
  <input type="radio" name="mode" value="pen" id="pen" v-model="mode" />
  <label for="pen">pen</label>
  <p>{{ coords }}</p>
</template>
