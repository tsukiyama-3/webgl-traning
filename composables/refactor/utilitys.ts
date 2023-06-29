export const useUtility = () => {
  const uint32ArrayToImageData = (array, width: number, height: number) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const imageData = context?.createImageData(width, height);
    const data = imageData?.data;

    // Uint32Array のデータを ImageData のデータにコピーする
    for (let i = 0, j = 0; i < array.length; i++, j += 4) {
      const pixel = array[i];
      data![j] = pixel & 0xff; // Red コンポーネント
      data![j + 1] = (pixel >> 8) & 0xff; // Green コンポーネント
      data![j + 2] = (pixel >> 16) & 0xff; // Blue コンポーネント
      data![j + 3] = (pixel >> 24) & 0xff; // Alpha コンポーネント
    }

    return imageData;
  };
  return {
    uint32ArrayToImageData,
  };
}