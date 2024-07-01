<script lang="ts">
  import { onMount } from 'svelte';

  let moving = $state(false);
  let resizingX = $state(false);
  let resizingY = $state(false);
  let windowWidth = $state(0);
  let windowHeight = $state(0);
  let offsetWindow = $state(false);
  let maximize = $state({
    fullscreened: false,
    preWidth: 0,
    preHeight: 0,
    preLeft: 0,
    preTop: 0
  });
  let { windowBounds }: { windowBounds: HTMLDivElement } = $props();
  let maxTop = $state(0);

  let left = $state(0);
  let top = $state(0);
  let windowElement: HTMLDivElement | undefined = $state();

  onMount(() => {
    if (windowElement) {
      windowWidth = windowBounds.clientWidth / 2;
      windowHeight = windowBounds.clientHeight / 2;
      top = windowBounds.clientHeight / 4;
      left = windowBounds.clientWidth / 4;
      maxTop = windowBounds.clientTop - 10;
    }
  });

  const onMouseMove = (e: MouseEvent, offset: boolean = false) => {
    if (moving && windowElement) {
      const maxLeft = windowBounds.clientLeft - 10;
      left += e.movementX;
      if (top < maxTop) {
        top = maxTop;
      }
      top += e.movementY;
      if (maximize.fullscreened) {
        toggleSize(e.clientX);
      }
    }

    if (resizingX && windowElement) {
      const prevWidth = windowWidth;
      if (!offsetWindow) windowWidth = windowElement.clientWidth + e.movementX;
      else {
        windowWidth = windowElement.clientWidth - e.movementX;
        if (prevWidth !== windowWidth) left += e.movementX;
      }
    }

    if (resizingY && windowElement) {
      if (!offsetWindow) windowHeight = windowElement.clientHeight + e.movementY;
      else {
        windowHeight = windowElement.clientHeight - e.movementY;
        top += e.movementY;
      }
    }
  };

  const toggleSize = (externalLeft: null | number = null) => {
    if (windowElement) {
      if (!maximize.fullscreened) {
        maximize.fullscreened = true;
        maximize.preHeight = windowHeight;
        maximize.preWidth = windowWidth;
        maximize.preTop = top;
        maximize.preLeft = left;
        windowWidth = windowBounds.clientWidth;
        windowHeight = windowBounds.clientHeight;
        top = 0;
        left = 0;
      } else {
        maximize.fullscreened = false;
        windowWidth = maximize.preWidth;
        windowHeight = maximize.preHeight;
        top = maximize.preTop;
        left = maximize.preLeft;

        if (externalLeft) {
          left = externalLeft / 2;
          top = 0;
        }
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
    if (top < maxTop + 10 && !maximize.fullscreened) {
      maximize.preTop = 0;
      toggleSize();
    }
    if (resizingX) resizingX = false;
    if (resizingY) resizingY = false;
  };
</script>

<svelte:window onmouseup={onMouseUp} onmousemove={onMouseMove} />
<div class="absolute w-full border-2 rounded-lg bg-white opacity-50 blur-lg" style="top: 0; left: 0 height: 0"></div>
<div
  class="window absolute resizable-window select-none"
  style="left: {left}px; top: {top}px; width:{windowWidth}px; height:{windowHeight}px"
  bind:this={windowElement}
>
  <div
    class="absolute -top-[1px] cursor-n-resize h-[2px] w-full select-none"
    role="none"
    onmousedown={() => onMouseDown('resizingY', true)}
  ></div>
  <div
    class="absolute bottom-[0px] cursor-s-resize h-[2px] w-full"
    role="none"
    onmousedown={() => onMouseDown('resizingY')}
  ></div>
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
    <div
      class="title-bar-text select-none w-full"
      ondblclick={() => toggleSize()}
      onmousedown={() => onMouseDown('moving')}
      role="none"
    >
      A Window With Stuff In It
    </div>
    <div class="title-bar-controls">
      <button aria-label="Minimize"></button>
      <button aria-label="Maximize" onclick={() => toggleSize()}></button>
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
