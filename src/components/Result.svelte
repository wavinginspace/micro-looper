<script>
  import PlayFilled from 'carbon-icons-svelte/lib/PlayFilled24';
  import PauseFilled from 'carbon-icons-svelte/lib/PauseFilled24';
  import { sound } from '../store';
  import { onMount } from 'svelte';

  export let result;

  let paused = true;
  let innerSize = 0;
  let timer;
  let time = '';
  function printTime() {
    let hrs = ~~(result.duration / 3600);
    let mins = ~~((result.duration % 3600) / 60);
    let secs = ~~result.duration % 60;
    // Output like "1:01" or "4:03:59" or "123:03:59"

    if (hrs > 0) {
      time += '' + hrs + ':' + (mins < 10 ? '0' : '');
    }

    time += '' + mins + ':' + (secs < 10 ? '0' : '');
    time += '' + secs;
    return time;
  }

  onMount(() => {
    printTime();
  });

  function loadSound() {
    sound.set({
      sound: result.previews['preview-hq-ogg'],
      name: result.name,
      image: result.images.waveform_bw_m,
    });
    paused = true;
  }

  function colorWaveform() {
    let { duration } = result;
    let increment;
    let intervalDuration;

    if (paused && timer) clearInterval(timer);

    // change increment based on clip length to avoid going below minimum interval time (4ms)
    if (duration >= 5) {
      increment = 0.5;
      intervalDuration = 200;
    } else if (duration >= 2) {
      increment = 1;
      intervalDuration = 100;
    } else {
      increment = 2;
      intervalDuration = 50;
    }

    timer = setInterval(() => {
      paused && clearInterval(timer);
      if (innerSize <= 100) {
        innerSize += increment;
      } else {
        innerSize = 0;
        clearInterval(timer);
      }
    }, (result.duration / intervalDuration) * 1000);
  }

  function handlePreviewClick() {
    paused = !paused;
    colorWaveform();
  }

</script>

<div
  data-tooltip="Click to load player with sound"
  class="result-list-item-wrapper bg-white relative hover:shadow-lg border-gray-800 border"
  style="background-image: url('{result.images
    .waveform_bw_m}'); background-repeat: round;"
  on:click={loadSound}
>
  <div class="progress-overlay" style="width: {innerSize}%;" />
  <div class="waveform-overlay" />

  <li class="result-list-item relative pr-7 ">
    <div class="inline-flex w-full items-center justify-between">
      <span
        class="sound-link text-indigo-600 font-transition text-xs  font-bold mr-4 break-words truncate"
      >
        {result.name.split('.')[0]}
        <!-- {result.name.length > 24
            ? result.name.substring(0, 21) + '...'
            : result.name.split('.')[0]} -->
      </span>
      <span class="text-xs text-gray-800 font-medium">{time}</span>
    </div>
    <!-- <br /> -->
    <!-- <a class="sound-download-link">DL</a> -->
    <audio
      id={`audio${result.id}`}
      class="sound-preview-audio"
      src={result.previews['preview-hq-mp3']}
      controls
      type="audio/mp3"
      preload="auto"
      bind:paused
    >
      <track kind="captions" />
    </audio>
    <div
      class="preview-icon absolute top-0 right-0"
      on:click|stopPropagation={handlePreviewClick}
    >
      {#if paused}
        <PlayFilled class="preview-icon" />
      {:else}
        <PauseFilled class="preview-icon" />
      {/if}
    </div>
    <!-- <span class="sound-description text-sm">
      {@html result.description.substring(0, 20) + '...'}
    </span> -->
    <!-- <img src="{result.images.waveform_bw_m}" alt="" /> -->
  </li>
</div>

<style>
  .sound-preview-audio {
    display: none;
  }

  .preview-icon {
    width: 20px;
    height: 20px;
    @apply text-indigo-500 hover:text-indigo-700;
  }

  .result-list-item-wrapper {
    cursor: pointer;
    padding: 0.5rem;
    margin: 0 auto 1rem;
    border-radius: 5px;
    position: relative;
    transition: 0.2s ease all;
    width: 100%;
    max-width: 400px;
    transition: 0.2s ease all;
    background-blend-mode: luminosity;
    & .sound-description {
      font-style: italic;
    }
    &:hover {
      background: rgb(255 255 255 / 0%);
    }
  }

  .progress-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 5px;
    height: 100%;
    background: rgb(9 243 148 / 37%);
  }

  .waveform-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 5px;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.57);
    /* backdrop-filter: hue-rotate(141deg); */
  }

</style>
