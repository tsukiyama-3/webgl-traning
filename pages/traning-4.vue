<script setup lang="ts">
import { useCanvas } from "~/composables/refactor/canvas";
import { useGrid } from "~/composables/refactor/grid";
import { useEvent } from "~/composables/refactor/events";
import { useTool } from "~/composables/refactor/tools";

const { canvas, preview, gridCanvas, hoverCanvas, backgroundCanvas } =
  useCanvas();
const { toggleGrid } = useGrid();
const { mode } = useTool()
const { onCanvasMousemove, onCanvasMousedown, onCanvasMouseup } = useEvent();

</script>

<template>
  <div
    @mousedown="onCanvasMousedown($event, canvas, mode)"
    @mousemove="onCanvasMousemove($event, canvas, hoverCanvas)"
    @mouseup="onCanvasMouseup"
  >
    <div style="position: relative; width: 512px; height: 512px">
      <canvas
        data="background"
        ref="backgroundCanvas"
        width="512"
        height="512"
        style="border: 1px solid #d3d3d3; position: absolute"
      ></canvas>
      <canvas
        data="canvas"
        ref="canvas"
        width="512"
        height="512"
        style="border: 1px solid #d3d3d3; position: absolute"
      ></canvas>
      <canvas
        data="hover"
        ref="hoverCanvas"
        width="512"
        height="512"
        style="border: 1px solid #d3d3d3; position: absolute"
      ></canvas>
      <canvas
        data="grid"
        ref="gridCanvas"
        width="512"
        height="512"
        style="border: 1px solid #d3d3d3; position: absolute"
      ></canvas>
    </div>
    <canvas
      ref="preview"
      width="128"
      height="128"
      style="border: 1px solid #d3d3d3"
    ></canvas>
    <button @click="toggleGrid(gridCanvas)">Grid</button>
    {{ mode }}
    <input type="radio" name="mode" value="pen" id="pen" v-model="mode" />
    <label for="pen">pen</label>
    <input type="radio" name="mode" value="bucket" id="bucket" v-model="mode" />
    <label for="bucket">bucket</label>
  </div>
</template>
