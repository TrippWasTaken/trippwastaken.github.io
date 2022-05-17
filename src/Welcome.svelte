<script lang="ts">
  import { onMount } from "svelte"
  import anime from "animejs/lib/anime.es.js"
  import Main from "./Main.svelte"

  let mainReady: Boolean = false
  const welcomeAnim = () => {
    anime.set("div#intro", {
      translateX: "-50%",
      translateY: "-50%",
      letterSpacing: "-1rem",
      opacity: 0,
      overflow: "hidden",
    })
    anime({
      targets: "div#intro",
      duration: 1000,
      letterSpacing: "1rem",
      opacity: 1,
      easing: "cubicBezier(.12,.67,.3,.9)",
    })
  }

  const finalAnim = () => {
    anime.set("div#intro-line", {
      height: "0%",
    })
  }

  const lineAnim = () => {
    anime.set("div#intro-line", {
      translateX: "-50%",
      translateY: "-50%",
      opacity: 0,
    })
    anime({
      targets: "div#intro-line",
      duration: 1000,
      opacity: 1,
      width: "50%",
      easing: "cubicBezier(0, 0.69, 0.28, 0.99)",
      height: {
        value: "50%",
        duration: 1000,
        delay: 1000,
        easing: "cubicBezier(.12,.67,.3,.9)",
      },
      complete: function (anim) {
        mainReady = true
      },
    })
  }

  onMount(() => {
    welcomeAnim()
    lineAnim()
  })
</script>

<main class="container">
  <div id="intro">Welcome</div>
  <div id="intro-line" />
  {#if mainReady}
    <Main />
  {/if}
</main>

<style lang="scss">
  .container {
    height: 100vh;
    width: 100vw;
  }

  #intro {
    z-index: 2;
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    overflow: hidden;
    color: white;
    text-transform: uppercase;
    font-size: 6rem;
    mix-blend-mode: difference;
  }

  #intro-line {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    background-color: white;
    height: 0.25rem;
  }
</style>
