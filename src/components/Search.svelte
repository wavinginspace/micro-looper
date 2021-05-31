<script>
  import Result from "./Result.svelte";
  import Loader from "./Loader.svelte";
  import { sound, random } from "../store";

  const PARAMS = `name,username,id,url,description,images,duration,download,previews,type,normalized=1`;
  let search = "";
  let results = fetchData("cello");

  const debounce = (callback, wait) => {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback.apply(null, args);
      }, wait);
    };
  };

  async function fetchData(query, randomPage = "") {
    if (randomPage) {
      query += randomPage;
    }
    console.log(query);
    try {
      const res = await fetch(
        `/.netlify/functions/token-hider?query=${query}&fields=${PARAMS}`
      );
      const data = await res.json();
      console.log(data);
      return data;
    } catch (err) {
      return console.error(err);
    }
  }

  function handleGetAdjacentPage(page) {
    results = fetchData(page);
  }

  async function handleRandomClick() {
    search = "";
    let randomNum = Math.floor(Math.random() * (50000 / 15));
    let randomPage = `&page=${randomNum}`;
    results = fetchData("", randomPage);
    return results;
  }

  const handleSearch = debounce((e) => {
    if (search) {
      results = fetchData(search);
    }
  }, 500);

  function pickRandom() {
    const randomIndex = Math.floor(Math.random() * 15);
    return results?.results[randomIndex];
  }

  function setRandom(randomSound) {
    sound.set({
      sound: randomSound.previews["preview-hq-ogg"],
      name: randomSound.name,
    });
  }

  async function getRandomSound() {
    try {
      const randomResults = await handleRandomClick();
      const randomSound = await pickRandom();
      setRandom(randomSound);
      random.set(false);
    } catch (err) {
      console.error(err);
    }
  }

  $: if ($random) getRandomSound();

</script>

<div class="relative max-w-5xl mx-auto">
  <div class="search-container mx-auto max-w-4xl relative mt-4 px-8">
    <!-- TODO come up with better design pattern than using empty div for flex spacing. or replace with Sort By select -->
    <div></div>
    <input
      type="search"
      id="search-bar"
      class="border text-sm min-w-24 text-indigo-500 rounded-sm border-indigo-600 p-2 outline-none focus:ring-2 ring-offset-2 ring-indigo-400 ring-opacity-40 placeholder-indigo-300"
      name="search-bar"
      placeholder="Search FreeSound"
      bind:value="{search}"
      on:input|preventDefault="{handleSearch}" />
    <button
      on:click|preventDefault="{handleRandomClick}"
      class="text-sm font-bold w-32 bg-white text-gray-700 border-green-300 border-2 py-2 px-3 rounded-lg hover:text-indigo-600 outline-none transition-all focus:outline-none focus:ring-2 ring-offset-2 ring-indigo-200 ring-opacity-40 active:outline-none active:mt-2 hidden sm:block">
      Random Page
    </button>
  </div>

  <div
    class="results-wrapper pb-12 md:pb-0 w-full my-0 mx-auto relative max-w-4xl">
    {#await results}
      <Loader />
    {:then value}
      <ul id="results">
        {#each value.results as result}
          {#if result}
            <Result result="{result}" />
          {/if}
        {/each}
      </ul>
      <div
        class="flex justify-between items-center px-8 mx-auto w-full max-w-4xl">
        {#if value.previous}
          <button
            class="font-bold bg-white border-gray-800 text-gray-800  border-2 rounded-lg hover:text-indigo-600 active:mt-0.5 transition-all p-2 mr-auto"
            on:click="{() => handleGetAdjacentPage(value.previous)}">
            Prev
          </button>
        {/if}
        <button
          class="font-bold ml-auto bg-white border-gray-800 text-gray-800 border-2 rounded-lg hover:text-indigo-600 active:mt-0.5 transition-all p-2 "
          on:click="{() => handleGetAdjacentPage(value.next)}">
          Next
        </button>
      </div>
    {:catch error}
      {console.error(error)}
    {/await}
  </div>
</div>

<style>
  .results-wrapper {
    height: 100%;
    width: 100%;
    overflow: auto;
    transition: height 0.66s ease-out;

    @media (min-width: 768px) {
      min-height: 550px;
    }
  }

  ul {
    list-style-type: none;
    margin: 2rem auto 0;
    padding: 0 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-column-gap: 1rem;
  }

  .search-container {
    display: grid;
    grid-template-areas: "empty search random";
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto;
    & button {
      justify-self: end;
    }
  }

  @media (max-width: 845px) {
    ul :global .result-list-item-wrapper:last-child {
      display: none;
    }
  }

  input[type="search"]::-webkit-search-cancel-button {
    -webkit-appearance: none;
    height: 1em;
    width: 1em;
    border-radius: 50em;
    background: url(https://pro.fontawesome.com/releases/v5.10.0/svgs/solid/times.svg)
      no-repeat 50% 50%;
    background-size: contain;
    opacity: 0;
    pointer-events: none;
    cursor: pointer;
  }

  input[type="search"]:focus::-webkit-search-cancel-button {
    opacity: 0.5;
    pointer-events: all;
    transition: 0.2s ease all;
    &:hover {
      opacity: 0.7;
    }
  }

</style>
