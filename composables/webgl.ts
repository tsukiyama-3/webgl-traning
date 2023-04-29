export const useWebGL = () => {
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
  return { createShader, createProgram };
};
