<template>
  <div class="landing-glow" :class="{ 'is-mirrored': mirrored }" aria-hidden="true">
    <div class="glow-bands">
      <span v-for="band in 14" :key="band" :style="{ '--phase': `${-band * 390}ms` }"/>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ mirrored?: boolean }>()
</script>

<style scoped>
.landing-glow {
  position: absolute;
  z-index: -1;
  overflow: hidden;
  background: url('/landing-course-glow.svg') center / 100% 100% no-repeat;
  mask: url('/landing-glow-mask.svg') center / 100% 100% no-repeat;
  pointer-events: none;
}
.is-mirrored { transform: scaleY(-1); }

@media (prefers-reduced-motion: no-preference) {
  .glow-bands {
    position: absolute;
    inset: 0 auto 0 50%;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(14, 7.7778%);
    opacity: var(--glow-strength, 1);
    transform: translateX(-53.8889%);
    mask-image: linear-gradient(transparent 9%, #0004 22%, #000 38%, #000 59%, transparent 85%);
  }
  .glow-bands span {
    background: linear-gradient(90deg, #adf6ffda, #54dff4a1 9%, #1dc4ed73 36%, transparent 93%);
    mask-image: linear-gradient(transparent 17%, #000 44%, #000a 56%, transparent 81%);
    animation: glow-band 5.4s cubic-bezier(.45,0,.55,1) var(--phase) infinite;
    animation-play-state: var(--glow-play-state, paused);
  }
}

@media (max-width: 720px) {
  .landing-glow { background-size: 185% 100%; }
  .glow-bands { width: 185%; }
}

@keyframes glow-band {
  0%, 100% { opacity: .08; transform: translateY(14%) scaleY(.82); }
  38% { opacity: .98; transform: translateY(-17%) scaleY(1.06); }
  68% { opacity: .36; transform: translateY(-2%) scaleY(.91); }
}
</style>
