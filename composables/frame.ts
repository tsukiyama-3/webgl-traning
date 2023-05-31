export const useFrame = () => {

  const width = 64;
  const height = 64;
  const id = ref(0);
  const frame = {
    width,
    height,
    id: id.value++,
    pixels: new Uint32Array(width * height),
  };

  

  const setPixel = (x: number, y: number, color: number) => {
    const index = y * width + x;
    frame.pixels[index] = color
  }
  return { frame, setPixel };
};
