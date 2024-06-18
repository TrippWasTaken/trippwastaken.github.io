<script lang="ts">
  import '../app.css';
  import '98.css';
  import TaskBarButton from './components/taskBarButton.svelte';
  import WindowComponent from './components/windowComponent.svelte';

  const taskbarBtns = [
    {
      src: '/png/windows-0.png',
      aria: 'start',
      btnText: 'start'
    },
    {
      src: '/png/msie1-1.png',
      aria: 'internet',
      btnText: null
    },
    {
      src: '/png/computer_explorer-5.png',
      aria: 'my computer',
      btnText: null
    }
  ];
</script>

<div class="bg-slate-500 min-h-full min-w-full absolute z-0">
  <WindowComponent />
  <div class="absolute overflow-hidden bottom-0 left-0 min-w-full p-1 h-12 flex justify-between items-center taskbar">
    <div>placeholder</div>
    <div class="inline-flex items-center h-full">
      {#each taskbarBtns as btn}
        <TaskBarButton src={btn.src} aria={btn.aria} btnText={btn.btnText} />
      {/each}
    </div>
    <div>placeholder</div>
  </div>
</div>

<style>
  .taskbar {
    background-color: silver;
    box-shadow: inset 1px 1px #fff;
  }
</style>
