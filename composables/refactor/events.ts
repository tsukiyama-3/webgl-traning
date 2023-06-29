import { useCoord } from "./coords";
import { usePixel } from "./pixels";
import { useTool } from "./tools";
import { useColor } from "./colors";
import { useUtility } from "./utilitys";

export const useEvent = () => {
  const config = useRuntimeConfig();
  const { coords, previousCol, previousRow, getRelativeCoordinates } =
    useCoord();
  const { drawAt, fillAt, hoverAt } = useTool();
  const {
    pixels,
    undoPixelsStates,
    getPixelColor,
    containsPixel,
    getLinePixels,
  } = usePixel();
  const { originalColor } = useColor();
  const { uint32ArrayToImageData } = useUtility();
  const isClicked = ref(false);
  const onCanvasMousemove = (
    event: MouseEvent,
    canvas: HTMLCanvasElement | null,
    hoverCanvas: HTMLCanvasElement | null,
  ) => {
    coords.value = getRelativeCoordinates(event.clientX, event.clientY, canvas);
    if (isClicked.value) {
      if (
        Math.abs(coords.value.x - previousCol.value) > 1 ||
        Math.abs(coords.value.y - previousRow.value) > 1
      ) {
        const interpolatedPixels = getLinePixels(
          coords.value.x,
          previousCol.value,
          coords.value.y,
          previousRow.value
        );
        for (let i = 0, l = interpolatedPixels.length; i < l; i++) {
          const coords = interpolatedPixels[i];
          drawAt(coords.col, coords.row, canvas);
        }
      } else {
        drawAt(coords.value.x, coords.value.y, canvas);
      }
      previousCol.value = coords.value.x;
      previousRow.value = coords.value.y;
    }
    hoverAt(coords.value.x, coords.value.y, hoverCanvas);
  };
  const onCanvasMousedown = (
    event: MouseEvent,
    canvas: HTMLCanvasElement | null,
    mode: string
  ) => {
    isClicked.value = true;
    coords.value = getRelativeCoordinates(event.clientX, event.clientY, canvas);
    previousCol.value = coords.value.x;
    previousRow.value = coords.value.y;
    if (mode === "pen") {
      drawAt(coords.value.x, coords.value.y, canvas);
    } else if (mode === "bucket") {
      const startTime = performance.now();
      fillAt(coords.value.x, coords.value.y, canvas);
      const endTime = performance.now();
      console.log(`fill実行時間: ${endTime - startTime} ミリ秒`);
    }
    if (containsPixel(coords.value.x, coords.value.y)) {
      const originalPixelColor = getPixelColor(coords.value.x, coords.value.y, pixels);
      originalColor.value = originalPixelColor;
    }
  };
  const onCanvasMouseup = () => {
    isClicked.value = false;
    const imageData = uint32ArrayToImageData(
      pixels.value,
      config.public.canvasSize,
      config.public.canvasSize
    );
    undoPixelsStates.value.push(imageData);
  };
  return { onCanvasMousemove, onCanvasMousedown, onCanvasMouseup };
};
