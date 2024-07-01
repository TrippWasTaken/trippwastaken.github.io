<script lang="ts">
  import { onMount } from 'svelte';

  let moving = $state(false);
  let resizingX = $state(false);
  let resizingY = $state(false);
  let minWidthReached = $state(false);
  let prevWidth = $state(0);
  let windowWidth = $state(0);
  let windowHeight = $state(0);
  let offsetWindow = $state(false);

  let { windowBounds }: { windowBounds: HTMLDivElement } = $props();

  let left = $state(0);
  let top = $state(0);
  let windowElement: HTMLDivElement | undefined = $state();

  onMount(() => {
    if (windowElement) {
      windowWidth = windowBounds.clientWidth / 2;
      windowHeight = windowBounds.clientHeight / 2;
    }
  });

  console.log(windowBounds);
  const onMouseMove = (e: MouseEvent, offset: boolean = false) => {
    if (moving && windowElement) {
      left += e.movementX;
      top += e.movementY;
    }

    if (resizingX && windowElement) {
      const prevWidth = windowWidth;
      if (!offsetWindow) windowWidth = windowElement.clientWidth + e.movementX;
      else {
        windowWidth = windowWidth = windowElement.clientWidth - e.movementX;
        if (prevWidth !== windowWidth) left += e.movementX;
      }
    }
  };

  const onMouseDown = (valueToSwitch: string, offset = false) => {
    switch (valueToSwitch) {
      case 'moving':
        moving = true;
        break;
      case 'resizingX':
        resizingX = true;
        break;
      case 'resizingY':
        resizingY = true;
        break;
      default:
        break;
    }

    if (offset) offsetWindow = true;
    else offsetWindow = false;
  };

  const onMouseUp = () => {
    if (moving) moving = false;
    if (resizingX) resizingX = false;
    if (resizingY) resizingY = false;
  };
</script>

<svelte:window onmouseup={onMouseUp} onmousemove={onMouseMove} />
<div
  class="window absolute resizable-window select-none"
  style="left: {left}px; top: {top}px; width:{windowWidth}px; height:{windowHeight}px"
  bind:this={windowElement}
>
  <div class="absolute -top-[1px] cursor-n-resize h-[2px] w-full select-none" role="none"></div>
  <div class="absolute bottom-[0px] cursor-s-resize h-[2px] w-full"></div>
  <div
    class="absolute -left-[1px] cursor-w-resize w-[2px] h-full"
    role="none"
    onmousedown={() => onMouseDown('resizingX', true)}
  ></div>
  <div
    class="absolute right-[1px] cursor-e-resize w-[2px] h-full"
    role="none"
    onmousedown={() => onMouseDown('resizingX')}
  ></div>

  <div class="title-bar select-none">
    <div class="title-bar-text select-none w-full" onmousedown={() => onMouseDown('moving')} role="none">
      A Window With Stuff In It
    </div>
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
  .window {
    min-width: fit-content;
    min-height: fit-content;
  }
</style>
