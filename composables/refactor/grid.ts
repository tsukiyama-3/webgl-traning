import { useRender } from "./render";

export const useGrid = () => {
  const config = useRuntimeConfig();
  const toggleGrid = (canvas: HTMLCanvasElement | null) => {
    const { renderGrid } = useRender();
    config.public.visibleGrid = !config.public.visibleGrid;
    renderGrid(canvas);
  };
  return {
    toggleGrid,
  };
};
