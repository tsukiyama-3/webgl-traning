export const usePixel = () => {
  const pixels = ref<Uint32Array>(new Uint32Array(32 * 32));
  const hoverPixels = ref<Uint32Array>(new Uint32Array(32 * 32));
  const undoPixelsStates = ref([]);
  const redoPixelsStates = ref([]);
  const config = useRuntimeConfig();
  const containsPixel = (col: number, row: number) => {
    return (
      col >= 0 &&
      row >= 0 &&
      col < config.public.canvasSize &&
      row < config.public.canvasSize
    );
  };
  const getPixelColor = (x: number, y: number, pixels: Ref<Uint32Array>) => {
    if (containsPixel(x, y)) {
      return pixels.value![y * config.public.canvasSize + x];
    } else {
      return null;
    }
  };
  const setPixelColor = (x: number, y: number, color: number, pixels: Ref<Uint32Array>) => {
    if (containsPixel(x, y)) {
      const index = y * config.public.canvasSize + x;
      pixels.value![index] = color;
    }
  };
  const visitConnectedPixels = (pixel: any, pixelVisitor: any) => {
    const queue = [];
    const visitedPixels = [];
    const dy = [-1, 0, 1, 0];
    const dx = [0, 1, 0, -1];
    queue.push(pixel);
    visitedPixels.push(pixel);
    pixelVisitor(pixel);

    const loopCount = ref(0);
    const cellCount = config.public.canvasSize * config.public.canvasSize;
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
  const getLinePixels = (x0: number, x1: number, y0: number, y1: number) => {
    const returnPixels = [];
    // x1 = normalize(x1, 0);
    // y1 = normalize(y1, 0);
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      returnPixels.push({ col: x0, row: y0 });
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
    return returnPixels;
  };
  return {
    pixels,
    hoverPixels,
    undoPixelsStates,
    redoPixelsStates,
    containsPixel,
    getPixelColor,
    setPixelColor,
    visitConnectedPixels,
    getLinePixels,
  };
};
