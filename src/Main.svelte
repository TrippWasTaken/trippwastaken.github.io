<script lang="ts">
  import { onMount } from "svelte"
  import anime from "animejs/lib/anime.es.js"
  import Navbar from "./Navbar.svelte"
  import Projects from "./Projects.svelte"
  import CircleHover from "./CircleHover.svelte"
  import SideButtons from "./sideButtons.svelte"
  import Footer from "./Footer.svelte"
  import Media from "./Media.svelte"

  let mountNav = false
  let showHover = false
  const mainTransition = () => {
    const titlesAnim = () => {
      const titleTL = anime.timeline({
        duration: 2000,
        easing: "easeOutExpo",
      })

      titleTL
        .add({
          targets: "#title-0",
          translateY: "0%",
          complete: function (anim) {
            anime({
              targets: "#title-0",
              duration: 1000,
              translateY: "100%",
              easing: "easeOutExpo",
            })
          },
        })
        .add({
          targets: "#title-1",
          translateY: "0%",
          complete: function (anim) {
            anime({
              targets: "#title-1",
              duration: 1000,
              translateY: "100%",
              easing: "easeOutExpo",
            })
          },
        })
        .add({
          targets: "#title-2",
          translateY: "0%",
          complete: function (anim) {
            anime({
              targets: "#title-2",
              duration: 1000,
              translateY: "100%",
              easing: "easeOutExpo",
              complete: function (anim) {
                titlesAnim()
              },
            })
          },
        })
    }

    anime.set("div.banner-item", {
      translateY: "-100%",
    })

    anime
      .timeline({
        easing: "cubicBezier(.12,.67,.3,.9)",
      })
      .add(
        {
          targets: "div#intro",
          duration: 500,
          opacity: 0,
        },
        500
      )
      .add(
        {
          targets: "div#intro-line",
          height: "0%",
          complete: function (anim) {
            mountNav = true
            anime.set("body", {
              overflowY: "scroll",
            })
            anime({
              targets: "div.banner-item",
              duration: 1000,
              translateY: "0%",
              easeing: "cubicBezier(.1,.67,.3,.9)",
              delay: function (el, i, l) {
                return i * 500
              },
              complete: function (anim) {
                titlesAnim()
              },
            })
          },
        },
        500
      )
  }

  const titles = [`Frontend Developer`, `Music Producer`, `Videographer`]
  onMount(() => {
    anime.set(["#title-0", "#title-1", "#title-2"], {
      translateY: "100%",
      width: "500px",
    })
    mainTransition()
  })
</script>

<main class="main-content" id="home">
  <!-- <div id="main-transition" /> -->
  {#if mountNav}
    <Navbar />
    <SideButtons />
  {/if}
  <div id="content-render">
    <div id="home-banner-container">
      <div class="transition-banner">
        <div class="banner-item">
          <div class="hover-dot-action-wrapper">
            <div
              class="hover-dot dot-left"
              on:mouseenter={() => (showHover = true)}
              on:mouseleave={() => (showHover = false)}
            />
          </div>
          <div id="my-name-is-container">
            MY <span class="white-box">NAME</span> IS
          </div>
        </div>
      </div>

      <div class="transition-banner">
        <div class="banner-item">
          <div id="konrad-knecht-container">
            <span class="white-box">KONRAD</span> KNECHT
          </div>
        </div>
      </div>

      <div class="transition-banner">
        <div class="banner-item" id="banner-item-titles">
          <span id="banner-item-titles-elements">
            {#each titles as title, index}
              <span class="title-text" id={`title-${index}`}>{title}</span>
            {/each}
          </span>
          <div class="hover-dot dot-right" />
        </div>
      </div>
    </div>
  </div>
  <CircleHover show={showHover} />
  {#if mountNav}
    <Projects />
    <Media />
    <Footer />
  {/if}
</main>

<style lang="scss">
  .main-content {
    display: flex;
    flex-direction: column;
  }

  #banner-item-titles {
    font-family: Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text",
      "Times New Roman", serif;
    font-weight: 200;
    font-size: 2.75rem;
    display: flex;
    height: 1.25em;
    width: 100%;
  }

  .transition-banner {
    height: 4rem;
    overflow: hidden;
  }

  #banner-item-titles-elements {
    position: absolute;
    .title-text {
      position: absolute;
      top: 0;
      left: 0;
    }
  }

  .hover-dot {
    background-color: var(--yellow);
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
  }

  .hover-dot-action-wrapper {
    align-self: flex-start;
    float: left;
    margin-right: auto;
    padding: 1rem;
    width: 1.25rem;
    transition: 0.5s ease-in;
    z-index: 25;
  }

  .dot-right {
    align-self: flex-end;
    margin-left: auto;
    float: right;
  }

  .hover-dot-action-wrapper:hover {
    transform: scale(1.5);
    transition: 0.5s ease-out;
  }

  #home-banner-container {
    transform: scale(2);
  }

  .banner-item {
    display: flex;
    flex-direction: row;
    font-weight: 200;
    position: relative;
    overflow: hidden;
    height: 4rem;
  }

  #konrad-knecht-container {
    font-size: 3rem;
  }

  #my-name-is-container {
    font-size: 2.5rem;
  }

  .white-box {
    padding: 0 0.5rem;
    background-color: var(--yellow);
    color: var(--black);
    letter-spacing: 0px;
    display: inline-block;
    mix-blend-mode: difference;
  }

  #main-transition {
    background-color: var(--yellow);
    position: absolute;
    width: 100%;
    z-index: 5;
    mix-blend-mode: difference;
  }

  #content-render {
    letter-spacing: 6px;
    color: var(--yellow);
    font-size: 2rem;
    z-index: 10;
    mix-blend-mode: difference;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 100vh;
    flex-direction: column;
  }

  @media (max-width: 1024px) {
    #home-banner-container {
      transform: scale(1);
    }
  }
</style>
