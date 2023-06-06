<script setup lang="ts">
const canvas1 = ref()
const canvas2 = ref()

const canvas1Func = () => {
  const context = canvas1.value.getContext('2d')
  context.moveTo(0, 0)
  context.lineTo(400, 200)
  context.stroke()
}

const canvas2Func = () => {
  const context = canvas2.value.getContext('2d')
  context.beginPath()
  context.arc(190, 100, 80, 0, 2 * Math.PI)
  context.stroke()
}

onMounted(() => {
  canvas1Func()
  canvas2Func()
})
</script>

<template>
  <div>
    <canvas ref="canvas1" width="400" height="200" style="border:1px solid #d3d3d3;"></canvas>
    <canvas ref="canvas2" width="400" height="200" style="border:1px solid #d3d3d3;"></canvas>
  </div>
</template>