import { writable } from 'svelte/store';

export const sound = writable({
  sound: '',
  name: '',
  image: ''
});

export let random = writable(false);

export function modalOpen(initial) {
  const isOpen = writable(initial);
  const { set, update } = isOpen;
  return {
    isOpen,
    open: () => set(true),
    close: () => set(false),
    toggle: () => update((n) => !n)
  };
}

// export let loopTimes = writable({
//   loopStart: 0,
//   loopEnd: 0
// });

export let loopStart = writable(0);
export let loopEnd = writable(0);
