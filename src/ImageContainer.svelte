<script lang="ts">
  import { FastAverageColor } from "fast-average-color"
  import { onMount } from "svelte"

  export let src: string
  export let index: number
  export let sizing: any
  let img: any
  let container: any
  const colors = new FastAverageColor()

  const getColor = () => {
    colors.getColorAsync(img).then(({ hex }) => {
      container.style.backgroundColor = hex
    })
  }

  onMount(() => {
    if (img.src) getColor()
    container.style.height = `${sizing.height}%`
    container.style.width = `${sizing.width}%`
    container.style.left = `${sizing.left}%`
    container.style.top = `${sizing.top}%`
  })
</script>

<div class="photo-template" bind:this={container}>
  <img bind:this={img} {src} alt={`Image number ${index}`} />
</div>

<style lang="scss">
  .photo-template {
    position: absolute;
    border-radius: 1rem;
    overflow: hidden;
    transition: transform 500ms ease;
    &:hover {
      transform: scale(1.2);
    }
    img {
      height: 100%;
      width: 100%;
      opacity: 0;
      object-fit: cover;
      transition: opacity 250ms ease;
    }

    img:hover {
      opacity: 1;
    }
  }
</style>
