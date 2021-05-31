import { writable } from 'svelte/store';

export const sound = writable({
  sound: '',
  name: '',
});

export let random = writable(false);