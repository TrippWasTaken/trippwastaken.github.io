<script>
  import anime from "animejs"
  import { onMount } from "svelte"
  let scrollPos
  let viewHeight
  let changeBG = false
  let runAnim = true
  onMount(() => {
    anime.set("div#nav-bar", { opacity: 0 })
    anime({ targets: "div#nav-bar", duration: 2000, opacity: 1 })
  })
</script>

<div id="nav-bar">
  <div class="trippmedia-header">
    <div class="header-heading-container">
      <h1>TRIPPMEDIA.TECH</h1>
    </div>
    <div class="header-center-container">
      <nav class="nav-item"><a href="#home">HOME.</a></nav>
      <nav class="nav-item"><a href="#projects">PROJECTS.</a></nav>
      <!-- <nav class="nav-item">ABOUT.</nav> -->
    </div>
    <div class="header-end-container" />
  </div>
</div>

<style lang="scss">
  #nav-bar {
    width: 100%;
    z-index: 100;
    color: white;
    position: fixed;
    mix-blend-mode: difference;
  }

  .trippmedia-header {
    display: grid;
    grid-template-columns: [outer-left] 1fr [center-inner] 1fr [outer-right] 1fr;
    padding: 1rem 2rem;
  }

  .header-heading-container {
    display: flex;
    align-items: center;
    margin-right: auto;
  }

  .header-center-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .header-end-container {
    display: flex;
    align-items: center;
    margin-left: auto;
  }

  @media (max-width: 1024px) {
    .header-heading-container {
      display: none;
    }

    .trippmedia-header {
      display: flex;
    }
  }
</style>
