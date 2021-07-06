<script>
  import * as Tone from 'tone';
  import { usePrevious } from 'svelte-previous';
  import throttle from 'just-throttle';
  import LibLoader from './LibLoader.svelte';
  import Knob from './Knob.svelte';
  import SoundTitle from './SoundTitle.svelte';
  import { sound, random } from '../store';
  import { afterUpdate } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  import Play from 'carbon-icons-svelte/lib/PlayFilledAlt24';
  import Pause from 'carbon-icons-svelte/lib/PauseFilled24';
  import Loop from 'carbon-icons-svelte/lib/EdtLoop24';
  import Reverse from 'carbon-icons-svelte/lib/Renew24';
  import Reset from 'carbon-icons-svelte/lib/Reset20';
  import VolumeHigh from 'carbon-icons-svelte/lib/VolumeUpFilled20';
  import VolumeLow from 'carbon-icons-svelte/lib/VolumeDownFilled20';
  import VolumeOff from 'carbon-icons-svelte/lib/VolumeMuteFilled20';
  import Random from 'carbon-icons-svelte/lib/Network_420';

  let player = new Tone.GrainPlayer($sound.sound);
  const gainNode = new Tone.Gain();
  const pingPong = new Tone.PingPongDelay(0, 0);

  let recorder;
  let playTimer;
  let recordTimer;
  let recordMinutes = 0;
  let recordSecondsPlaceholder = 0;
  let recordSeconds = 0;
  let loadCount = 0;

  // setup recordDest for MediaRecorder
  let chunks = []; // where stream data gets stored
  const actx = Tone.context;
  const recordDest = actx.createMediaStreamDestination();

  function initOpusRecorder() {
    const workerOptions = {
      OggOpusEncoderWasmPath:
        'https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/OggOpusEncoder.wasm',
      WebMOpusEncoderWasmPath:
        'https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/WebMOpusEncoder.wasm'
    };

    let options = {
      mimeType: 'audio/wav'
    };
    // replace native MediaRecorder with OpusMediaRecorder
    // @ts-ignore
    window.MediaRecorder = OpusMediaRecorder;
    // @ts-ignore
    recorder = new MediaRecorder(recordDest.stream, options, workerOptions);
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = (e) => {
      // if no sound loaded, don't download
      if (!$sound.sound) return;
      // else load hidden audio element with recorded data and download
      audioRecord.src = '';
      let blob = new Blob(chunks);
      audioRecord.src = URL.createObjectURL(blob);
      let a = document.createElement('a');
      document.body.appendChild(a);
      a.href = audioRecord.src;
      a.download = `${$sound.name.split('.')[0]}.wav`;
      a.click();
      // TODO was throwing error - not needed? not supported by Service Workers
      // window.URL.revokeObjectURL(audioRecord.src);
    };
  }

  // TODO refactor this into object ??
  let playing = player?.state === 'started';
  let recording = recorder?.state === 'active';
  let audioRecord; // recording audio element
  let mute = false;
  let loop = false;
  let reverse = false;
  let gain = 1;
  let volume = -5.5;
  let detune = 0;
  let playbackRate = 1;
  let grainSize = 0.2;
  let ppTime = 0;
  let ppFeedback = 0;
  let ppWet = 1;
  let ppBypass = false;
  const [ppWetCurrent, ppWetPrev] = usePrevious(0);
  $: $ppWetCurrent = ppWet;

  // load player with sound file
  function modifyPlayer(soundFile) {
    // fade in/out to avoid click sound on load
    let fadeTime = 0.15;
    fadeOut(fadeTime);
    new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, fadeTime * 1000);
    })
      .then(() => player.dispose())
      .then(() => {
        player = new Tone.GrainPlayer(soundFile).chain(
          pingPong,
          gainNode,
          Tone.Destination,
          recordDest
        );
        console.log('loaded');
        loadCount++;
      });
    player.loopEnd = player.buffer.duration;
  }

  // listen for new sound file from store, load player
  $: if ($sound.sound) modifyPlayer($sound.sound);

  // auto turn off playing after load
  $: if (loadCount > 1) playing = false;

  function triggerRandom() {
    random.set(true);
  }

  function togglePlay() {
    playing = !playing;
  }

  function fadeOut(fadeTime) {
    gainNode.gain.setValueAtTime(gain, Tone.now());
    gainNode.gain.exponentialRampToValueAtTime(0.0001, Tone.now() + fadeTime);
    player.volume.setValueAtTime(volume, Tone.now());
    player.volume.exponentialRampToValueAtTime(-50, Tone.now() + fadeTime);
  }

  function fadeIn(fadeTime) {
    gainNode.gain.setValueAtTime(0.0001, Tone.now());
    gainNode.gain.exponentialRampToValueAtTime(gain, Tone.now() + fadeTime);
    player.volume.setValueAtTime(-50, Tone.now());
    player.volume.exponentialRampToValueAtTime(volume, Tone.now() + fadeTime);
  }

  afterUpdate(() => {
    let now = Tone.now();
    let fadeTime = 0.3;

    // Tone.loaded().then(() => {
    //   player.loopEnd = Math.min(player.buffer.duration, player.loopEnd);
    // });

    pingPong.feedback.setTargetAtTime(ppFeedback, now, fadeTime);
    pingPong.delayTime.setTargetAtTime(ppTime, now, fadeTime);
    pingPong.wet.setTargetAtTime(ppWet, now, fadeTime);
    gainNode.gain.setTargetAtTime(gain, now, fadeTime);
    player.volume.setTargetAtTime(volume, now, fadeTime);
    player.loop = loop;
    player.detune = detune;
    player.playbackRate = playbackRate;
    player.grainSize = grainSize;
  });

  function handleValueChange(e) {
    let { id, value } = e.detail;
    // assign values to GrainPlayer params
    id = value;
  }

  function handlePlayClick() {
    let fadeTime = 0.015;
    togglePlay();
    if (player.state == 'started') {
      clearTimeout(playTimer);
      // clearInterval(playheadTimer);
      // playheadPos = 0;
      playing = false;
      fadeOut(fadeTime);

      setTimeout(() => {
        if (recording) {
          ppWet = 0;
        }
        player.stop();
      }, fadeTime * 10000); // convert fadeTime to ms + 10^1 buffer for no pop
    } else if (player.state == 'stopped') {
      Tone.loaded().then(() => {
        player.start();
        player.loopEnd = player.buffer.duration;
        playing = true;
        fadeIn(fadeTime);
        playTimer = setTimeout(() => {
          if (!loop) {
            togglePlay();
            // clearInterval(playheadTimer);
          }
        }, 1000 * player.buffer.duration);
      });
    }
  }

  function handleLoopClick() {
    loop = !loop;
    if (playing && !loop) {
      togglePlay();
    }
  }

  // TODO refactor Promise into reusable function?

  function handleReverseClick() {
    reverse = !reverse;
    // fade in/out to avoid click
    let fadeTime = 0.2;
    fadeOut(fadeTime);

    new Promise((resolve) => {
      setTimeout(() => {
        resolve();
        player.reverse = reverse;
      }, fadeTime * 1000);
    }).then(() => fadeIn(fadeTime));
  }

  function handleMuteClick() {
    mute = !mute;
    // fade in/out to avoid click
    let fadeTime = 0.2;
    if (mute) {
      fadeOut(fadeTime);
      new Promise((resolve) => {
        setTimeout(() => {
          resolve();
          player.mute = mute;
        }, fadeTime * 1000);
      });
    } else {
      player.mute = false;
    }
  }

  function startTimer() {
    if (recordMinutes === 0 && recordSeconds === 0) {
      recordTimer = setInterval(() => {
        recordSeconds += 1;
        if (recordSeconds > 59) {
          recordSeconds = 0;
          recordMinutes += 1;
        }
      }, 1000);
    } else {
      clearInterval(recordTimer);
      recordMinutes = 0;
      recordSeconds = 0;
    }
  }

  function handleRecordClick() {
    startTimer();
    recording = !recording;
    if (recording) {
      chunks = [];
      recorder.start();
    } else {
      if (!playing) {
        ppWet = $ppWetPrev;
      }
      recorder.stop();
    }
  }

  // TODO refactor this to be general use for more fx, if adding more

  function toggleEffect() {
    ppBypass = !ppBypass;
    if (ppBypass) {
      ppWet = 0;
    } else {
      ppWet = $ppWetPrev;
    }
  }

  function reset() {
    handleMuteClick();
    playing = false;
    recording = false;
    loop = false;
    volume = -5.5;
    reverse = false;
    detune = 0;
    playbackRate = 1;
    grainSize = 0.2;
    ppTime = 0;
    ppFeedback = 0;
    ppWet = 1;
    ppBypass = false;
    mute = false;
    // player.loopStart = 0;
    // player.loopEnd = 0;
    // loopStartDiv.style.width = 0;
    // loopEndDiv.style.width = 0;
  }
</script>

<LibLoader
  url={[
    'https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/OpusMediaRecorder.umd.js',
    'https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/encoderWorker.umd.js'
  ]}
  on:loaded={initOpusRecorder}
/>

<audio bind:this={audioRecord} controls download class="hidden" />

<div
  class="sm:container p-4 mx-auto justify-center items-center flex flex-col border-gray-800"
>
  <h1 class="text-green-400 text-4xl mb-4 uppercase">Micro Looper</h1>
  <div
    id="playerContainer"
    class="px-8 pb-4 pt-10 w-80 bg-white border-2 relative rounded border-indigo-700"
  >
    <button
      data-tooltip="Load a random sound"
      on:click={triggerRandom}
      class="absolute outline-none focus:outline-none left-2 top-2"
    >
      <Random class="transition hover:text-indigo-500" />
    </button>

    {#if recording}
      <span
        class="absolute inset-x-0 text-center min-w-min top-2 text-gray-800 transition"
        transition:fade={{ duration: 200 }}
      >
        {recordMinutes}:
        <span hidden={recordSeconds > 9}>{recordSecondsPlaceholder}</span>
        {recordSeconds}
      </span>
    {/if}

    <button
      data-tooltip="Reset parameters"
      on:click={reset}
      class="absolute outline-none focus:outline-none right-9 top-2"
    >
      <Reset class="transition hover:text-indigo-500" />
    </button>
    <button
      data-tooltip={mute ? 'Unmute' : 'Mute'}
      on:click={handleMuteClick}
      class="absolute outline-none focus:outline-none right-2 top-2"
    >
      {#if mute || volume < -49.5}
        <VolumeOff class="transition text-gray-400" />
      {:else if volume > -20}
        <VolumeHigh class="transition" />
      {:else}
        <VolumeLow class="transition" />
      {/if}
    </button>

    <SoundTitle />

    <div class="mx-auto flex items-center justify-around w-100 space-x-1">
      <button
        id="play"
        data-tooltip={playing ? 'Pause' : 'Play'}
        on:click={handlePlayClick}
        on:touchend={handlePlayClick}
        class="control-button disabled:bg-gray-200"
        class:bg-green-100={playing}
        disabled={!$sound.name}
      >
        {#if playing}
          <Pause />
        {:else}
          <Play />
        {/if}
      </button>
      <button
        data-tooltip="Record playback"
        on:click={handleRecordClick}
        class="control-button flex justify-center disabled:bg-gray-200"
        disabled={!$sound.name}
      >
        <div class="w-6 h-6 flex justify-center items-center">
          <div
            class="w-5 h-5 bg-gray-800 rounded rounded-full"
            class:bg-red-500={recording}
          />
        </div>
      </button>
      <button
        data-tooltip="Loop"
        class="control-button"
        class:bg-green-100={loop}
        on:click={handleLoopClick}
      >
        <div class="loop-icon">
          <Loop />
        </div>
      </button>
      <button
        data-tooltip="Reverse"
        class="control-button"
        class:bg-green-100={reverse}
        on:click={handleReverseClick}
      >
        <Reverse />
      </button>
    </div>
    <!-- FX STARTS -->
    <div class="flex my-4 items-center justify-around">
      <div class="flex flex-col items-center">
        <Knob
          id="playbackRate"
          bind:value={playbackRate}
          step={0.01}
          min={0.01}
          max={2.0}
          on:emitValue={throttle(handleValueChange, 100)}
          valueDisplayFunction={(v) => Math.floor(v * 100) / 100}
        />
        <label
          class="text-xs text-center font-bold text-indigo-600"
          for="playbackRate"
        >
          Speed
        </label>
      </div>
      <div class="flex flex-col items-center">
        <Knob
          id="detune"
          bind:value={detune}
          step={100}
          min={-1200}
          max={1200}
          on:emitValue={throttle(handleValueChange, 100)}
          valueDisplayFunction={(v) => {
            let num = Math.round(v / 100);
            return num > 0 ? `+${num}` : num;
          }}
        />
        <label
          class="text-xs text-center font-bold text-indigo-600"
          for="pitchInput"
        >
          Pitch
        </label>
      </div>
      <div class="flex flex-col items-center">
        <Knob
          id="grainSize"
          bind:value={grainSize}
          step={0.0001}
          min={0.0001}
          max={0.2}
          on:emitValue={throttle(handleValueChange, 100)}
          valueDisplayFunction={(v) => Math.floor((v * 100000) / 200)}
        />
        <label
          class="text-xs text-center font-bold text-indigo-600"
          for="grain"
        >
          Grain
        </label>
      </div>
      <div class="flex flex-col items-center">
        <Knob
          id="volume"
          bind:value={volume}
          step={0.01}
          min={-50}
          max={0}
          primaryColor="#A5B4FC"
          secondaryColor="#6366F1"
          on:emitValue={throttle(handleValueChange, 100)}
          valueDisplayFunction={(v) => Math.round(v) * 2 + 100}
        />
        <label
          class="text-xs text-center font-bold text-indigo-600"
          for="volume"
        >
          Volume
        </label>
      </div>
    </div>
    <div class="flex my-4 items-center justify-around">
      <div>
        <button
          id="ppBypass"
          on:click={toggleEffect}
          class="text-xs uppercase font-bold transition"
          style="letter-spacing: .25em;"
          class:text-green-400={ppWet >= 0.01 &&
            (ppTime >= 0.1 || ppFeedback >= 0.01)}
        >
          Delay
        </button>
      </div>
      <div class="flex flex-col items-center">
        <Knob
          id="ppTime"
          bind:value={ppTime}
          step={0.01}
          min={0}
          max={5}
          on:emitValue={throttle(handleValueChange, 100)}
          valueDisplayFunction={(v) => Math.floor(v * 20)}
        />
        <label
          class="text-xs text-center font-bold text-indigo-600"
          for="ppTime"
        >
          Time
        </label>
      </div>
      <div class="flex flex-col items-center">
        <Knob
          id="ppFeedback"
          bind:value={ppFeedback}
          step={0.01}
          min={0}
          max={1}
          on:emitValue={throttle(handleValueChange, 100)}
          valueDisplayFunction={(v) => Math.floor(v * 100)}
        />
        <label
          class="text-xs text-center font-bold text-indigo-600"
          for="ppFeedback"
        >
          Feedback
        </label>
      </div>
      <div class="flex flex-col items-center">
        <Knob
          id="ppWet"
          bind:value={ppWet}
          step={0.001}
          min={0}
          max={1}
          on:emitValue={throttle(handleValueChange, 100)}
          on:input={toggleEffect}
          valueDisplayFunction={(v) => Math.floor(v * 100)}
        />
        <label
          class="text-xs text-center font-bold text-indigo-600"
          for="ppWet"
        >
          Wet
        </label>
      </div>
    </div>
  </div>
</div>

<style>
  .control-button {
    @apply border-2 border-indigo-600 rounded p-2 relative active:border-indigo-700 focus:border-indigo-700 focus:outline-none;
  }
</style>
