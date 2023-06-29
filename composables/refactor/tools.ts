import { usePixel } from "./pixels";
import { useRender } from "./render";
import { useColor } from "./colors";
import { useCoord } from "./coords";

export const useTool = () => {
  const {
    pixels,
    hoverPixels,
    redoPixelsStates,
    containsPixel,
    getPixelColor,
    setPixelColor,
    visitConnectedPixels,
  } = usePixel();
  const { renderPixel } = useRender();
  const { currentColor, originalColor, colorToInt } = useColor();
  const { originalCoords } = useCoord();
  const mode = ref("pen");
  const drawAt = (
    x: number,
    y: number,
    canvas: HTMLCanvasElement | null,
    targetPixels: Ref<Uint32Array> | null = pixels,
    alpha: number = 255
  ) => {
    if (containsPixel(x, y)) {
      setPixelColor(x, y, colorToInt(currentColor.value, alpha), targetPixels!);
      renderPixel(canvas, targetPixels!);
      redoPixelsStates.value = [];
    }
  };
  const fillAt = (x: number, y: number, canvas: HTMLCanvasElement | null) => {
    if (containsPixel(x, y)) {
      const startPixel = {
        col: x,
        row: y,
      };
      visitConnectedPixels(startPixel, (pixle: any) => {
        if (getPixelColor(pixle.col, pixle.row, pixels) === originalColor.value) {
          setPixelColor(
            pixle.col,
            pixle.row,
            colorToInt(currentColor.value),
            pixels
          );
          return true;
        } else {
          return false;
        }
      });
      renderPixel(canvas, pixels);
      redoPixelsStates.value = [];
    }
  };
  const hoverAt = (x: number, y: number, canvas: HTMLCanvasElement | null) => {
    if (originalCoords.value) {
      // 元の色に戻す
      setPixelColor(
        originalCoords.value.x,
        originalCoords.value.y,
        colorToInt(currentColor.value, 0),
        hoverPixels
      );
      renderPixel(canvas, hoverPixels);
    }
    if (containsPixel(x, y)) {
      // 新しい座標の色を変更する
      setPixelColor(x, y, colorToInt(currentColor.value, 76), hoverPixels);
      renderPixel(canvas, hoverPixels);
      originalColor.value = getPixelColor(x, y, pixels);
      originalCoords.value = { x, y };
    }
  };
  return {
    mode,
    drawAt,
    fillAt,
    hoverAt,
  };
};
