<script setup lang="ts">
const canvas = ref<HTMLCanvasElement | null>(null);
const gl: Ref<WebGLRenderingContext | null> = ref(null);

const { createShader, createProgram } = useWebGL();

const vshaderSource = `
attribute vec2 a_position;
uniform vec2 u_resolution;

void main() {
  vec2 zeroToOne = a_position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;
  gl_Position = vec4(clipSpace, 0, 1);
}
`;

const fshaderSource = `
precision mediump float;
uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}
`;

const setRectangle = (
  gl: WebGLRenderingContext,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
};

const randomInt = (range: number) => {
  return Math.floor(Math.random() * range);
};

onMounted(() => {
  canvas.value = document.querySelector("canvas");
  // WebGLコンテキストを取得
  gl.value = canvas.value?.getContext("webgl") ?? null;

  // シェーダー作成
  const vshader = createShader(
    gl.value!,
    gl.value!.VERTEX_SHADER,
    vshaderSource
  );
  const fshader = createShader(
    gl.value!,
    gl.value!.FRAGMENT_SHADER,
    fshaderSource
  );

  // プログラムオブジェクトを作成
  const program = createProgram(gl.value!, vshader!, fshader!);
  //
  const positionAttributeLocation = gl.value!.getAttribLocation(
    program!,
    "a_position"
  );
  // 頂点データのバッファオブジェクトを作成している
  const positionBuffer = gl.value?.createBuffer();
  // GPU上のメモリ内のバッファをアクティブにしている
  gl.value?.bindBuffer(gl.value.ARRAY_BUFFER, positionBuffer!);
  const position = [10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30];
  // 頂点データをGPU上のバッファにアップロードしている
  gl.value?.bufferData(
    gl.value.ARRAY_BUFFER,
    new Float32Array(position),
    gl.value.STATIC_DRAW
  );
  // webglUtils.resizeCanvasToDisplaySize(gl.value?.canvas)
  // キャンパスサイズをviewportに渡す。
  gl.value?.viewport(0, 0, gl.value.canvas.width, gl.value.canvas.height);
  // キャンパスをクリアにする
  gl.value?.clearColor(0, 0, 0, 0);
  gl.value?.clear(gl.value.COLOR_BUFFER_BIT);
  // 描画するプログラムを指定する
  gl.value?.useProgram(program!);
  // 属性オンにする。
  gl.value?.enableVertexAttribArray(positionAttributeLocation);

  const resolutionUniformLocation = gl.value?.getUniformLocation(
    program!,
    "u_resolution"
  );

  const size = 2;
  const type = gl.value?.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  // GPUのメモリ上にある頂点バッファから属性データをGPUに転送している。
  gl.value?.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type!,
    normalize,
    stride,
    offset
  );

  gl.value?.uniform2f(
    resolutionUniformLocation!,
    gl.value.canvas.width,
    gl.value.canvas.height
  );

  const colorUniformLocation = gl.value?.getUniformLocation(
    program!,
    "u_color"
  );

  // 50このランダムな四角形をランダム色で描画する
  for (let ii = 0; ii < 50; ++ii) {
    setRectangle(
      gl.value!,
      randomInt(300),
      randomInt(300),
      randomInt(300),
      randomInt(300)
    );
    gl.value?.uniform4f(
      colorUniformLocation!,
      Math.random(),
      Math.random(),
      Math.random(),
      1
    );

    const primitiveType = gl.value?.TRIANGLES;
    const offset = 0;
    const count = 6;
    gl.value?.drawArrays(primitiveType!, offset, count);
  }
});
</script>

<template>
  <div>
    <canvas width="512" height="512"></canvas>
  </div>
</template>
