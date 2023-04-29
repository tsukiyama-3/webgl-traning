<script setup lang="ts">
const canvas = ref<HTMLCanvasElement | null>(null);
const gl: Ref<WebGLRenderingContext | null> = ref(null);

const vshaderSource = `
attribute vec4 a_position;
void main() {
  gl_Position = a_position;
}
`;

const fshaderSource = `
precision mediump float;
void main() {
  gl_FragColor = vec4(1, 0, 0.5, 1);
}
`;

const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
) => {
  // シェーダーオブジェクトを作成
  const shader = gl.createShader(type);
  // GLSLのコードをGPUにアップロード シェーダーオブジェクトに対してシェーダーソースコードを設定している。
  gl.shaderSource(shader!, source);
  // シェーダーのコードをGPUで実行できるバイナリコードにコンパイルしている シェーダーオブジェクトに対してコンパイルしている コンパイル結果はシェーダーオブジェクトに直接保存される。
  gl.compileShader(shader!);
  const success = gl.getShaderParameter(shader!, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.log(gl.getShaderInfoLog(shader!));
  gl.deleteShader(shader);
};

const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) => {
  // 空のプログラムオブジェクトを作成
  const program = gl.createProgram();
  // プログラムオブジェクトに頂点シェーダーを付ける
  gl.attachShader(program!, vertexShader);
  // プログラムオブジェクトにフラグメントシェーダーを付ける
  gl.attachShader(program!, fragmentShader);
  // 追加したシェーダーをプログラムにリンクする
  gl.linkProgram(program!);
  const success = gl.getProgramParameter(program!, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  console.log(gl.getProgramInfoLog(program!));
  gl.deleteProgram(program);
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
  const position = [0, 0, 0, 0.5, 0.7, 0];
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
  const primitiveType = gl.value?.TRIANGLES;
  const count = 3;
  // 描画
  gl.value?.drawArrays(primitiveType!, offset, count);
});
</script>

<template>
  <div>
    <canvas></canvas>
  </div>
</template>
