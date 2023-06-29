export const useCoord = () => {
  const config = useRuntimeConfig();
  const coords = ref();
  const originalCoords = ref<{ x: number; y: number } | null>(null);
  const previousCol = ref(0);
  const previousRow = ref(0);
  const getRelativeCoordinates = (
    x: number,
    y: number,
    canvas: HTMLCanvasElement | null
  ) => {
    const canvasRect = canvas!.getBoundingClientRect();
    return {
      x: Math.floor((x - canvasRect.left) / config.public.dotSize),
      y: Math.floor((y - canvasRect.top) / config.public.dotSize),
    };
  };
  return {
    coords,
    originalCoords,
    previousCol,
    previousRow,
    getRelativeCoordinates,
  };
};
