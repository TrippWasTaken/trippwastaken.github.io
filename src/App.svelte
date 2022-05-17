<script lang="ts">
  import Welcome from "./Welcome.svelte"
  import Cursor from "./Cursor.svelte"
  import anime from "animejs"

  let scrollPos
  let viewHeight
  let changeBG = false
  let runAnim = true

  const scrollFunc = (e) => {
    if (scrollPos > viewHeight / 4) {
      changeBG = true
    } else {
      changeBG = false
    }

    if (changeBG) {
      if (runAnim) {
        runAnim = false
        anime({
          targets: ".color-body",
          opacity: 0,
          duration: 2000,
          easeing: "easeInExpo",
        })
      }
    }
    if (!changeBG) {
      if (!runAnim) {
        runAnim = true
        anime({
          targets: ".color-body",
          opacity: 1,
          duration: 2000,
          easeing: "easeInExpo",
        })
      }
    }
  }
</script>

<svelte:window
  bind:scrollY={scrollPos}
  bind:innerHeight={viewHeight}
  on:scroll={scrollFunc}
/>
<main>
  <div class="color-body" />
  <Cursor />
  <Welcome />
</main>

<style lang="scss">
  :global(html) {
    scroll-behavior: smooth;
  }
  .color-body {
    position: fixed;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background-color: black;
  }

  :global(body) {
    font-family: "Helvetica", "Arial", sans-serif;
    background-color: white;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  :global(a, a:visited) {
    color: white;
    padding: 0.5rem;
    position: relative;
    text-decoration: none;
  }

  :global(a::before) {
    content: "";
    position: absolute;
    display: block;
    width: 90%;
    height: 0.2rem;
    top: 5px;
    left: 0.2rem;
    background-color: black;
    transform: scaleX(0);
    transform-origin: top left;
    transition: transform 0.5s ease-in;
  }

  :global(a::after) {
    content: "";
    position: absolute;
    display: block;
    width: 90%;
    height: 0.2rem;
    bottom: 5px;
    left: 0.2rem;
    background-color: black;
    transform: scaleX(0);
    transform-origin: top right;
    transition: transform 0.5s ease-in;
  }

  :global(a:hover::before) {
    transform: scaleX(1);
  }

  :global(a:hover::after) {
    transform: scaleX(1);
  }

  :global(a:hover) {
    text-decoration: none;
    color: black;
    background-color: white;
    transition: 0.5s ease-in-out;
  }
</style>
