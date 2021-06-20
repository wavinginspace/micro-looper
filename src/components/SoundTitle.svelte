<script>
  import { sound } from '../store';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  export let player;

  let mousePositionX;
  let loopStartDiv;
  let loopEndDiv;
  let loopStartPos = 0;
  let loopEndPos = 250;
  let loopTimeMarker;
  let playheadPos = 0;
  let playheadTimer;
  let playerContainer;

  onMount(() => {
    loopStartDiv = document.querySelector('.loop-div__left');
    loopEndDiv = document.querySelector('.loop-div__right');
    playerContainer = document.querySelector('#playerContainer');
  });

  function markBoundary(offsetX) {
    if (offsetX < 250) {
      player.loopStart = 0;
    } else {
      player.loopEnd = player.buffer.duration;
    }
  }

  function resize(e) {
    let dx = e.x - mousePositionX;
    const { id } = e.target;
    const { offsetX } = e;
    mousePositionX = e.x;

    if (id === 'playerContainer') {
      // ** TODO - FIX THIS SO ONLY RUNS ON LEFT AND RIGHT BOUNDARIES, NOT Y
      if (offsetX < 32 || offsetX > 285) {
        markBoundary(offsetX);
      }
      return;
    }
    if (id === 'loopStart') {
      loopStartDiv.style.width =
        parseInt(getComputedStyle(loopStartDiv, '').width) + dx + 'px';
    } else if (id === 'loopEnd') {
      loopEndDiv.style.width =
        parseInt(getComputedStyle(loopEndDiv, '').width) - dx + 'px';
    }
  }

  function mapRange(value, a, b, c, d) {
    value = (value - a) / (b - a);
    return c + value * (d - c);
  }

  function handleLoopDrag(e) {
    if (!$sound.name) return;
    let { id } = e.target;

    if (e.offsetX >= 0 && id === 'loopStart') {
      mousePositionX = e.x;
      document.addEventListener('mousemove', resize, false);
    } else if (e.offsetX <= 250 && id === 'loopEnd') {
      mousePositionX = e.x;
      document.addEventListener('mousemove', resize, false);
    }
  }

  function setLoopPos(e) {
    document.removeEventListener('mousemove', resize, false);
    const { id } = e.target;
    if (!$sound.name) return;

    if (id === 'loopStart') {
      loopTimeMarker = mapRange(e.offsetX, 0, 250, 0, player.buffer.duration);
      player.loopStart = loopTimeMarker;
      console.log('ran');
    } else if (id === 'loopEnd') {
      loopTimeMarker = mapRange(
        e.target.getBoundingClientRect().width,
        0,
        250,
        0,
        player.buffer.duration
      );
      player.loopEnd = Math.abs(player.buffer.duration - loopTimeMarker);
    }
  }

  // TODO - KEEP OR DELETE?

  // function handleLoopPositionClick(e) {
  //   if (!$sound.name) return;
  //   let { offsetX } = e;
  //   let loopTime = mapRange(offsetX, 0, 250, 0, player.buffer.duration);

  //   console.log(loopTime);

  //   if (
  //     offsetX >= 0 &&
  //     offsetX < loopEndPos &&
  //     offsetX - loopStartPos < loopEndPos - offsetX
  //   ) {
  //     loopStartPos = offsetX;
  //     player.loopStart = loopTime;
  //     loopStartDiv.style.width = `${e.offsetX}px`;
  //   } else if (offsetX > loopStartPos && offsetX <= 250) {
  //     loopEndPos = offsetX;
  //     player.loopEnd = loopTime;
  //     loopEndDiv.style.width = `${250 - e.offsetX}px`;
  //   }
  // }

  export function resetLoopDivs() {
    loopStartDiv.style.width = 0;
    loopEndDiv.style.width = 0;
    loopStartPos = 0;
    loopEndPos = 250;
  }

  document.addEventListener('mouseup', function (e) {
    document.removeEventListener('mousemove', resize, false);
    setLoopPos(e);
  });

</script>

<div
  class="sound-title-wrapper p-2 mb-4 mx-auto border-gray-800 border rounded relative"
  style="background-image: url('{$sound.image}'); background-repeat: round;"
>
  <div
    class="bg-indigo-200 opacity-50 absolute w-full h-full flex items-center justify-center inset-0"
  >
    <div class="playhead" style="left: {playheadPos}px" />
    <div
      id="loopStart"
      class="loop-div loop-div__left z-10"
      on:mousedown={handleLoopDrag}
    />
    <div
      id="loopEnd"
      class="loop-div loop-div__right z-10"
      on:mousedown={handleLoopDrag}
    />
  </div>
  {#if $sound.name}
    {#each [$sound.name] as soundName (soundName)}
      <h2
        class="sound-title text-center font-semibold relative text-indigo-500 cursor-default select-none pointer-events-none"
        in:fly={{ y: -200, duration: 2000 }}
        out:fade
      >
        {soundName.length > 30
          ? `${soundName.split('.')[0].substring(0, 28)}...`
          : soundName.split('.')[0]}
      </h2>
    {/each}
  {:else}
    <h2 class="text-center font-semibold text-indigo-500 relative" out:fade>
      No sound loaded yet
    </h2>
  {/if}
</div>

<style>
  .sound-title-wrapper {
    text-align: center;
    overflow: hidden;
    height: 2.6rem;
    white-space: nowrap;
  }

  .loop-div {
    @apply h-full bg-white absolute top-0;
    width: 0;
    &::after {
      content: ' ';
      position: absolute;
      width: 8px;
      height: 100%;
      cursor: ew-resize;
    }
    &__left {
      left: 0;
      position: absolute;
      &::after {
        right: -4px;
      }
    }
    &__right {
      right: 0;
      &::after {
        left: -4px;
      }
    }
    background-blend-mode: luminosity;
  }
</style>
