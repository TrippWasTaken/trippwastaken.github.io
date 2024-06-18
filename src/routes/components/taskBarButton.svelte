<script lang="ts">
  export let src: string;
  export let aria: string;
  export let btnText: string | null;

  const openWindow = () => {};
</script>

<button
  aria-label={`${aria} button`}
  class=" inline-flex justify-center items-center taskbar-btn h-full"
  on:click={openWindow}
>
  <div class="max-h-full aspect-square min-h-full p-1">
    <img class="object-contain h-full aspect-square" {src} alt={`${aria} icon`} />
  </div>
  {#if btnText}
    {btnText}
  {/if}
</button>

<style>
</style>
