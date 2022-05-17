<script lang="ts">
  import anime from "animejs"
  let y

  const moveCur = (e: MouseEvent) => {
    y = e.pageX
    anime({
      targets: "div.cursor",
      translateX: e.pageX - 4,
      translateY: e.pageY - 4,
      duration: 100,
      easeing: "easeInSine",
    })
  }
</script>

<svelte:window on:mousemove={moveCur} />
<div class="cursor" />

<style lang="scss">
  .cursor {
    z-index: 100;
    width: 0.5rem;
    height: 0.5rem;
    background-color: white;
    border-radius: 50%;
    position: absolute;
    pointer-events: none;
    opacity: 1;
    mix-blend-mode: exclusion;
  }
</style>
