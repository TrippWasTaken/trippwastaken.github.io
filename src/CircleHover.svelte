<script lang="ts">
  import anime from "animejs"
  import { onMount } from "svelte"

  export let show
  let currIndex = 0
  const images = [
    "/images/1.jpg",
    "/images/2.jpg",
    "/images/3.jpg",
    "/images/4.jpg",
    "/images/5.jpg",
  ]

  const setIndex = () => {
    currIndex += 1
    if (currIndex > 4) {
      currIndex = 0
    }
  }
  onMount(() => {
    setInterval(setIndex, 2000)
    anime.set("div.banner-circle-hover-container", {
      opacity: 0,
    })
  })

  $: {
    if (show) {
      anime({
        targets: "div.banner-circle-hover-container",
        opacity: 1,
      })
    } else {
      anime({
        targets: "div.banner-circle-hover-container",
        opacity: 0,
      })
    }
  }
</script>

<div class="banner-circle-hover-container ">
  <img id="images-banner" src={images[currIndex]} alt="images" />
</div>

<style lang="scss">
  .banner-circle-hover-container {
    width: 50%;
    max-width: 720px;
    height: calc(100% - 10rem);
    background-color: var(--yellow);
    mix-blend-mode: difference;
    z-index: 10;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: 1 ease-in;
    overflow: hidden;
    img {
      object-fit: cover;
      height: 100%;
      width: 100%;
    }
  }
</style>
