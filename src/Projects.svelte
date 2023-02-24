<script>
  import anime from "animejs"

  const projects = [
    {
      name: "Tunnel Vision",
      description:
        "An Audio visualizer featuring a 3D tunnel made up of continously changing lines, featuring 4 songs by me to choose from.",
      liveLink: "https://trippwastaken.github.io/music-visualizer/",
      gitLink: "https://github.com/TrippWasTaken/music-visualizer",
      tech: ["Svelte", "Web Audio API", "ThreeJS", "SCSS"],
    },
    {
      name: "Personal Portfolio",
      description:
        "My own personal site that you are currently viewing, here I show off any projects from all the creative fields I practice",
      liveLink: "https://trippmedia.tech/",
      gitLink: "https://github.com/TrippWasTaken/trippwastaken.github.io",
      tech: ["Svelte", "AnimeJS", "SCSS"],
    },
    {
      name: "React clipping tool",
      description: "An ongoing attempt to create a small clipping tool so I dont have to open davinci resolve everytime I want to show the boys something cool I did in apex legends, Its build in React using DaisyUI ontop of TailwindCSS",
      gitLink: 'https://github.com/TrippWasTaken/Video-editor',
      tech: ["React", "TailwindCSS", "Web Audio API", "WasmFFMPEG"]
    }
  ]

  const projectEnter = (e) => {
    anime({
      targets: e.target,
      scale: 1.1,
    })
  }

  const projectLeave = (e) => {
    anime({
      targets: e.target,
      scale: 1,
    })
  }
</script>

<div class="projects-container" id="projects">
  <h1 class="projects-heading"><span>PROJECTS</span></h1>
  {#each projects as project, index}
    <div class="animeTarget" />
    <div
      class="project-container-box"
      id="project-{index}"
      on:mouseenter={projectEnter}
      on:mouseleave={projectLeave}
    >
      <div class="container-left">
        <h2 class="heading-project">{project.name}</h2>
        <span class="tech-container">
          {#each project.tech as tech}
            <div class="tech-item-container">{tech}</div>
          {/each}
        </span>
      </div>
      <div class="container-right">
        <span>{project.description}</span>
        <span class="links-container">
          <br />
          <br />
          {#if project.liveLink}            
          <a href={project.liveLink} target="_blank" rel="noopener noreferrer"
            >live</a
          >
          {/if}
          {#if project.liveLink && project.gitLink}
          ||
          {/if}
          <a href={project.gitLink} target="_blank" rel="noopener noreferrer"
            >git</a
          >
        </span>
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  .projects-heading {
    font-size: 2rem;
    color: var(--yellow);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .container-left {
    width: 50%;
  }

  .heading-project {
    font-size: 2rem;
  }

  .container-right {
    width: 50%;
    margin-top: 4rem;
    padding: 1rem;
    font-size: 1.25rem;
    flex-direction: column;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tech-item-container {
    padding: 0.25rem;
    margin: 0.25rem;
    background-color: var(--yellow);
    color: var(--black);
    border-radius: 5px;
    font-size: 1.2rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .tech-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .project-container-box {
    display: flex;
    width: 75%;
    border-left: var(--yellow) 0.75rem solid;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .projects-container {
    margin: 5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 20;
    color: var(--yellow);
    mix-blend-mode: difference;
  }

  .links-container {
    font-size: 2rem;
  }

  @media (max-width: 1024px) {
    .project-container-box {
      flex-direction: column;
      width: 100%;
    }

    .container-left {
      width: 100%;
    }

    .container-right {
      width: 100%;
    }
  }
</style>
