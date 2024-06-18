<script lang="ts">
  let moving = $state(false);

  let left = $state(100);
  let top = $state(100);
  let windowElement: HTMLDivElement | undefined = $state();
  const onMouseMove = (e: MouseEvent) => {
    if (moving && windowElement) {
      console.log('moving', windowElement);
      console.log(e);
      left += e.movementX;
      top += e.movementY;
    }
  };

  const onMouseDown = () => {
    moving = true;
  };

  const onMouseUp = () => {
    moving = false;
  };
</script>

<svelte:window onmouseup={onMouseUp} onmousemove={onMouseMove} />
<div class="window absolute" style="width: 50%; height: 50%; left: {left}px; top: {top}px" bind:this={windowElement}>
  <div class="title-bar select-none" onmousedown={onMouseDown} role="none">
    <div class="title-bar-text">A Window With Stuff In It</div>
    <div class="title-bar-controls">
      <button aria-label="Minimize"></button>
      <button aria-label="Maximize"></button>
      <button aria-label="Close"></button>
    </div>
  </div>
  <div class="window-body">
    <p>There's so much room for activities!</p>
  </div>
</div>

<style>
</style>
