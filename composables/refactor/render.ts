export const useRender = () => {
  const config = useRuntimeConfig();
  const renderPixel = (
    canvas: HTMLCanvasElement | null,
    pixels: Ref<Uint32Array>
  ) => {
    const context = canvas!.getContext("2d");
    const offscreenCanvas = document.createElement("canvas");
    const offscreenContext = offscreenCanvas.getContext("2d");
    offscreenCanvas.width = config.public.canvasSize;
    offscreenCanvas.height = config.public.canvasSize;
    const imageData = offscreenContext?.createImageData(
      config.public.canvasSize,
      config.public.canvasSize
    );
    const imgDataData = imageData?.data;
    const data = new Uint8ClampedArray(pixels.value.buffer);
    imgDataData?.set(data);
    offscreenContext?.putImageData(imageData!, 0, 0);
    context!.clearRect(
      0,
      0,
      config.public.canvasSize,
      config.public.canvasSize
    );
    context!.save();
    context!.drawImage(offscreenCanvas, 0, 0);
    context!.restore();
  };
  const renderGrid = (canvas: HTMLCanvasElement | null) => {
    const context = canvas?.getContext("2d");
    if (config.public.visibleGrid) {
      context!.strokeStyle = "rgba(0, 0, 0, 1)";
      context!.lineWidth = 1 / 32;
    } else {
      context!.clearRect(
        0,
        0,
        config.public.canvasSize,
        config.public.canvasSize
      );
      return;
    }

    // 横の罫線を描画
    for (let x = 1; x < 32; x += 1) {
      context!.beginPath();
      context!.moveTo(x, 0);
      context!.lineTo(x, 32);
      context!.stroke();
    }

    // 縦の罫線を描画
    for (let y = 1; y < 32; y += 1) {
      context!.beginPath();
      context!.moveTo(0, y);
      context!.lineTo(32, y);
      context!.stroke();
    }
  };
  return {
    renderPixel,
    renderGrid,
  };
};
