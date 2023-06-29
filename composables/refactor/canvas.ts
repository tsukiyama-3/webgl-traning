import { useRender } from "./render";
import { usePixel } from "./pixels";

export const useCanvas = () => {
  const config = useRuntimeConfig();
  const { pixels } = usePixel();
  const canvas = ref<HTMLCanvasElement | null>(null);
  const preview = ref<HTMLCanvasElement | null>(null);
  const gridCanvas = ref<HTMLCanvasElement | null>(null);
  const hoverCanvas = ref<HTMLCanvasElement | null>(null);
  const backgroundCanvas = ref<HTMLCanvasElement | null>(null);
  const init = () => {
    const { renderPixel } = useRender();
    const context = canvas.value!.getContext("2d");
    context!.imageSmoothingEnabled = false;
    context!.scale(config.public.dotSize, config.public.dotSize);
    renderPixel(canvas.value, pixels);
    const gridContext = gridCanvas.value!.getContext("2d");
    gridContext!.imageSmoothingEnabled = false;
    gridContext!.scale(config.public.dotSize, config.public.dotSize);
    const backgroundContext = backgroundCanvas.value!.getContext("2d");
    backgroundContext!.imageSmoothingEnabled = false;
    backgroundContext!.scale(config.public.dotSize /2, config.public.dotSize / 2);
    const hoverContext = hoverCanvas.value!.getContext("2d");
    hoverContext!.imageSmoothingEnabled = false;
    hoverContext!.scale(config.public.dotSize, config.public.dotSize);
    const previewContext = preview.value!.getContext("2d");
    previewContext!.imageSmoothingEnabled = false;
    previewContext!.scale(config.public.dotSize / 4, config.public.dotSize / 4);
  };
  const hoge = (canvas: HTMLCanvasElement | null) => {
    const context = canvas!.getContext("2d");

    // パターンを作成
    const patternSize = 2; // パターンのサイズ
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;
    const patternContext = patternCanvas.getContext("2d");

    // パターンの背景色
    patternContext!.fillStyle = "rgba(0, 0, 0, 0.05)"; // 白色
    patternContext!.fillRect(0, 0, patternSize, patternSize);

    // チェック柄の描画
    patternContext!.fillStyle = "rgba(255, 255, 255)"; // 黒色
    patternContext!.fillRect(0, 0, patternSize / 2, patternSize / 2);
    patternContext!.fillRect(
      patternSize / 2,
      patternSize / 2,
      patternSize / 2,
      patternSize / 2
    );

    // パターンを作成し、描画コンテキストに適用
    const pattern = context!.createPattern(patternCanvas, "repeat");
    context!.fillStyle = pattern;
    context!.fillRect(0, 0, canvas!.width, canvas!.height);
  };
  onMounted(() => {
    init();
    hoge(backgroundCanvas.value);
  });
  return {
    canvas,
    preview,
    gridCanvas,
    hoverCanvas,
    backgroundCanvas,
  };
};
