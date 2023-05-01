<script setup lang="ts">
import { Application, Assets, Sprite } from "pixi.js";

onMounted(async() => {
  const app = new Application({
    width: 512,
    height: 512,
    backgroundColor: 0x2c3e50,
  });
  const texture = await Assets.load("https://pixijs.io/examples/examples/assets/bunny.png");
  document.body.appendChild(app.view);

  const bunny = new Sprite(texture);

  bunny.x = app.renderer.width / 2;
  bunny.y = app.renderer.height / 2;

  bunny.anchor.x = 0.5;
  bunny.anchor.y = 0.5;

  app.stage.addChild(bunny);

  app.ticker.add(() => {
    // each frame we spin the bunny around a bit
    bunny.rotation += 0.01;
  });
});
</script>

<template>
  <div></div>
</template>
