<script context="module">
  const modalList = [];

</script>

<script>
  import { modalOpen } from '../store';
  import Close from 'carbon-icons-svelte/lib/Close20';
  import { fade } from 'svelte/transition';

  const store = modalOpen(false);
  const { isOpen, open, close } = store;
  function keydown(e) {
    e.stopPropagation();
    if (e.key === 'Escape') {
      close();
    }
  }

  function transitionend(e) {
    const node = e.target;
    node.focus();
  }

  function modalAction(node) {
    const returnFn = [];
    // for accessibility
    if (document.body.style.overflow !== 'hidden') {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      returnFn.push(() => {
        document.body.style.overflow = original;
      });
    }
    node.addEventListener('keydown', keydown);
    node.addEventListener('transitionend', transitionend);
    node.focus();
    modalList.push(node);
    returnFn.push(() => {
      node.removeEventListener('keydown', keydown);
      node.removeEventListener('transitionend', transitionend);
      modalList.pop();
      // Optional chaining to guard against empty array.
      modalList[modalList.length - 1]?.focus();
    });
    return {
      destroy: () => returnFn.forEach((fn) => fn()),
    };
  }

</script>

<slot name="trigger" {open}>
  <!-- fallback trigger to open the modal -->
  <button on:click={open} />
</slot>
{#if $isOpen}
  <div
    class="modal z-10"
    transition:fade={{ duration: 100 }}
    use:modalAction
    tabindex="0"
  >
    <div class="backdrop" on:click={close} />

    <div
      class="content-wrapper relative p-5 bg-indigo-900 text-gray-200 border border-gray-200"
    >
      <button on:click={close} class="absolute top-1 right-1 hover:text-red-200"
        ><Close /></button
      >
      <slot name="header" {store}>
        <!-- fallback -->
        <div>
          <p />
        </div>
      </slot>

      <div class="content">
        <slot name="content" {store} />
      </div>

      <slot name="footer" {store}>
        <!-- fallback -->
        <div>
          <p />
        </div>
      </slot>
    </div>
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1;
  }

  .modal:not(:focus-within) {
    transition: opacity 0.1s;
    opacity: 0.99;
  }

  .backdrop {
    background-color: rgba(0, 0, 0, 0.7);
    position: absolute;
    width: 100%;
    height: 100%;
    transition: all 2s ease;
  }

  .content-wrapper {
    z-index: 10;
    width: 100%;
    max-width: 400px;
    border-radius: 0.3rem;
    overflow: hidden;
  }

  @media (max-width: 480px) {
    .content-wrapper {
      max-width: 90vw;
    }
  }

  .content {
    max-height: 50vh;
    overflow: auto;
  }

  .content p {
    color: red;
  }

</style>
