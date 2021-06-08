<script>
  import Modal from './Modal.svelte';
  import GithubIcon from 'carbon-icons-svelte/lib/LogoGithub24';
  import HelpIcon from 'carbon-icons-svelte/lib/Help24';

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
        <button on:click={open} class="transition hover:text-indigo-500"
          ><HelpIcon /></button
        >
      </div>

      <div slot="content" class="content text-xs transition">
        <p>
          <span class="text-green-400 font-semibold">Micro Looper</span> is a tool
          for generating infinite sounds.
        </p>
        <p>
          To use, simply search for samples via FreeSound and click on a result
          to load into the player, where you can loop, reverse, manipulate the
          speed, pitch, grain, delay speed and delay feedback amount of the
          current loaded sample.
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
