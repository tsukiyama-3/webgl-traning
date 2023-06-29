export const useColor = () => {
  const currentColor = ref("#ff0000");
  const originalColor = ref<number | null>(null);
  const colorToInt = (color: string, alpha: number = 255) => {
    const hex = color.replace("#", "");
    const red = parseInt(hex.substr(0, 2), 16);
    const green = parseInt(hex.substr(2, 2), 16);
    const blue = parseInt(hex.substr(4, 2), 16);
    const colorInt = ((alpha << 24) >>> 0) + (blue << 16) + (green << 8) + red;
    return colorInt;
  };
  return {
    currentColor,
    originalColor,
    colorToInt,
  };
}