<script lang="ts">
  import Icon from "@iconify/svelte"
  import anime from "animejs"
  import { onMount } from "svelte"

  onMount(() => {
    anime.set("#side-nav-container", { opacity: 0 })
    anime({
      targets: "#side-nav-container",
      opacity: 1,
      delay: 1000,
      duration: 1000,
    })
  })
</script>

<div id="side-nav-container">
  <span class="icon-btn">
    <a
      href="https://github.com/TrippWasTaken"
      target="_blank"
      rel="noopener noreferrer"
      class="link"
    >
      <Icon icon="entypo-social:github" style="font-size: 2rem" />
    </a></span
  >
  <span class="icon-btn">
    <a
      href="https://soundcloud.com/solyeong"
      target="_blank"
      rel="noopener noreferrer"
      class="link"
    >
      <Icon icon="entypo-social:soundcloud" style="font-size: 2rem" />
    </a></span
  >
  <span class="icon-btn">
    <a
      href="https://www.youtube.com/channel/UC_vnpxE0e2PO3Yb7LGAKxIw"
      target="_blank"
      rel="noopener noreferrer"
      class="link"
    >
      <Icon icon="entypo-social:youtube" style="font-size: 2rem" />
    </a></span
  >
  <span class="icon-btn">
    <a
      href="https://www.linkedin.com/in/konrad-knecht/"
      target="_blank"
      rel="noopener noreferrer"
      class="link"
    >
      <Icon icon="entypo-social:linkedin" style="font-size: 2rem" />
    </a></span
  >
  <span class="icon-btn">
    <a
      href="https://www.behance.net/konradknecht"
      target="_blank"
      rel="noopener noreferrer"
      class="link"
    >
      <Icon icon="akar-icons:behance-fill" style="font-size: 2rem" />
    </a>
  </span>
  <span class="icon-btn">
    <a
      href="mailto:tripp@trippmedia.tech"
      target="_blank"
      rel="noopener noreferrer"
      class="link"
    >
      <Icon icon="entypo:email" style="font-size: 2rem" />
    </a>
  </span>
</div>

<style lang="scss">
  #side-nav-container {
    margin: 2rem;
    width: 2rem;
    margin-top: 10%;
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: white;
    mix-blend-mode: difference;
    z-index: 20;
    opacity: 1;
    span {
      margin: 1rem;
    }
  }

  .link {
    color: white;
  }

  .link:hover {
    background-color: black;
  }

  .icon-btn:hover {
    transform: scale(1.5);
    transition: 0.1s ease-in;
  }

  .icon-btn {
    mix-blend-mode: difference;
    transition: 0.1s ease-out;
  }

  @media (max-width: 1024px) {
    #side-nav-container {
      width: 100%;
      margin: 2rem 0rem;
      left: 0;
      display: flex;
      flex-direction: row;
      bottom: 5%;
      position: fixed;
      color: white;
      mix-blend-mode: difference;
      z-index: 50;
      opacity: 1;
    }
  }
</style>
