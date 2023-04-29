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
  const shader = gl.createShader(type);
  if (shader) {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }
};

const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) => {
  const program = gl.createProgram();
  if (program) {
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }
};

onMounted(() => {
  canvas.value = document.querySelector("canvas");
  gl.value = canvas.value?.getContext("webgl") ?? null;

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
  const program = createProgram(gl.value!, vshader!, fshader!);
  const positionAttributeLocation = gl.value!.getAttribLocation(
    program!,
    "a_position"
  );
  const positionBuffer = gl.value?.createBuffer();
  gl.value?.bindBuffer(gl.value.ARRAY_BUFFER, positionBuffer!);
  const position = [0, 0, 0, 0.5, 0.7, 0];
  gl.value?.bufferData(
    gl.value.ARRAY_BUFFER,
    new Float32Array(position),
    gl.value.STATIC_DRAW
  );
  // webglUtils.resizeCanvasToDisplaySize(gl.value?.canvas)
  gl.value?.viewport(0, 0, gl.value.canvas.width, gl.value.canvas.height);
  gl.value?.clearColor(0, 0, 0, 0)
  gl.value?.clear(gl.value.COLOR_BUFFER_BIT)
  gl.value?.useProgram(program!)
  gl.value?.enableVertexAttribArray(positionAttributeLocation)
  gl.value?.bindBuffer(gl.value.ARRAY_BUFFER, positionBuffer!)
  const size = 2
  const type = gl.value?.FLOAT
  const normalize = false
  const stride = 0
  const offset = 0
  gl.value?.vertexAttribPointer(positionAttributeLocation, size, type!, normalize, stride, offset)
  const primitiveType = gl.value?.TRIANGLES
  const count = 3
  gl.value?.drawArrays(primitiveType!, offset, count)
});
</script>

<template>
  <div>
    <canvas></canvas>
  </div>
</template>
