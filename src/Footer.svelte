<script>
  const dateYear = new Date().getFullYear()
  const loopText = [1, 1, 1, , 1, 1, 1, 1, 1, , 1, 1, , 1, 1]
</script>

<div class="footer-container">
  <span class="text-container">
    <p class="loop">
      {#each loopText as item}
        <span class="copyright-cont">© Konrad Knecht {dateYear} </span>
      {/each}
    </p>
  </span>
</div>

<style lang="scss">
  .footer-container {
    color: var(--black);
  }
  .copyright-cont {
    font-size: 2rem;
    padding: 0 1rem
  }

  .loop {
    margin: 0;
    white-space: nowrap;
    overflow: clip;
    background-color: var(--yellow);
    padding: 2rem 0;
  }

  .loop span {
    display: inline-block;
    animation: loop 5s linear infinite;
  }

  @keyframes loop {
    0% {
      transform: translate3d(0, 0, 0);
    }
    100% {
      transform: translate3d(-100%, 0, 0);
    }
  }
</style>
