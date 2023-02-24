<script lang="ts">
  import anime from "animejs"
  import { each, onMount } from "svelte/internal"
  import ImageContainer from "./ImageContainer.svelte"

  const photos = [
    "/images/media/1.jpg",
    "/images/media/2.jpg",
    "/images/media/3.jpg",
    "/images/media/4.jpg",
    "/images/media/5.jpg",
    "/images/media/6.jpg",
  ]

  const sizing = [
    {
      height: 23,
      width: 20,
      left: 5,
      top: 5,
    },
    {
      height: 30,
      width: 14,
      left: 51,
      top: 7,
    },
    {
      height: 19,
      width: 14,
      left: 16,
      top: 39,
    },
    {
      height: 27,
      width: 27,
      left: 8,
      top: 70,
    },
    {
      height: 22,
      width: 20,
      left: 49,
      top: 74,
    },
    {
      height: 24,
      width: 18,
      left: 72,
      top: 40,
    }
  ]

  let container, galleryX, galleryY, gallery, mouseX = 0, mouseY = 0, heading

  const mouseMove = e => {
    const border = container.getBoundingClientRect()
    mouseX = Math.floor(e.clientX - border.left)
    mouseY = Math.floor(e.clientY - border.top)

    const xPer = mouseX / container.offsetWidth
    const yPer = mouseY / container.offsetHeight

    // console.log(xPer, yPer)
    const panX = ((galleryX-container.offsetWidth)  * xPer) * -1
    const panY = ((galleryY-container.offsetHeight) * yPer) * -1
    gallery.animate({
      transform: `translate(${panX}px, ${panY}px)`
    }, {
      duration: 200,
      fill: "forwards",
      easing: 'ease'
    })

    heading.animate({
      transform: `translate(${panX * 0.1}px, ${panY * 0.1}px)`
    }, {
      duration: 200,
      fill: "forwards",
      easing: 'ease'
    })
  } 

  onMount(()=> {
    galleryX = container.offsetWidth * 2
    galleryY = container.offsetHeight * 2
  })
</script>

<div class="media-container" id="media">
  
  <div class="photos-container" bind:this={container} on:mousemove={mouseMove}>
    <h1 class="projects-heading" bind:this={heading} on:click={()=> {
      window.open('https://www.youtube.com/watch?v=rAaQXDc_u2Y&list=PLdspHqRH7byQkWjHkHGyrhk0ZbY4QOGlp&index=1', '_blank').focus()
      }}><span>MEDIA</span></h1>
    <div class="gallery-box" style="min-height: {galleryY}px; min-width: {galleryX}px" bind:this={gallery}>
      {#each photos as photo, index}
        <ImageContainer src={photo} index={index} sizing={sizing[index]}/>
      {/each}
    </div>
  </div>
  
</div>

<style lang="scss">
  .projects-heading {
    z-index: 10;
    font-size: 4rem;
    color: var(--yellow);
    position: absolute;
    top: 50%;
    left: 50%;
    transition: all 1s ease;
    transform: scale(1) translate(-50%, -50%);
    mix-blend-mode: difference;
    &:hover{
      transform: scale(0) translate(-50%, -50%);
      cursor: pointer;
    }
    &::after{
      content: "FILM";
      color: var(--black);
      text-align: center;
      display: inline-block;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 120%;
      aspect-ratio: 1/1;
      border-radius: 50%;
      background-color: var(--yellow);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      transition: transform 500ms ease;
    }
    &:hover::after{
      transform: translate(-50%, -50%) scale(1);
    }
  }

  .gallery-box{
    overflow: hidden;
    opacity: 0;
    transition: opacity 200ms ease-in;
    &:hover{
      opacity: 1;
    }
  }

  .photos-container {
    border-radius: 1rem;
    color: var(--black);
    display: flex;
    width: 90%;
    background-color: var(--yellow);
    aspect-ratio: 16/9;
    overflow: hidden;
    z-index: 5;
    position: relative;
  }
  
  .media-container{
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: var(--black);
  }

</style>
