<script>
  import Modal from './Modal.svelte';
  import GithubIcon from 'carbon-icons-svelte/lib/LogoGithub24';
</script>

<div class="absolute top-2 right-2 ">
  <div class="flex">
    <a
      href="https://github.com/wavinginspace/micro-looper"
      class="transition hover:text-indigo-500 mr-1"
      target="_blank"
    >
      <GithubIcon />
    </a>
    <Modal>
      <div slot="trigger" let:open>
        <button on:click={open} class="transition hover:text-indigo-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-help-circle"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </div>

      <div slot="content" class="content text-xs transition">
        <p>
          <span class="text-green-400 font-semibold">Micro Looper</span>
          is a tool for generating infinite sounds.
        </p>
        <p>
          Search for samples via FreeSound and click on a result to load into
          the player, where you can loop, reverse, manipulate the speed, pitch,
          grain, delay speed and delay feedback amount of the current loaded
          sample.
        </p>

        <ul>
          <li>
            - Audition search results by clicking on the play icon on right side
            of each result.
          </li>
          <li>
            - Press the record button to record and automatically export
            whatever is playing and download as a wav file.
          </li>

          <li>
            - Drag the left or right side of the blue sound name box to change
            the the loop in/out points.
          </li>
          <li>
            - Click the Random Sound icon on the top left of the player to load
            a random sound into the player.
          </li>
          <li>
            - Click the Random Page button to load a random page of results from
            FreeSound.
          </li>
        </ul>
      </div>
    </Modal>
  </div>
</div>

<style>
  .content p:not(:last-child) {
    margin-bottom: 1rem;
  }

  .content li:not(:last-child) {
    margin-bottom: 0.5rem;
  }
</style>
