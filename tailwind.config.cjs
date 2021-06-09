module.exports = {
  mode: 'jit',
  purge: {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    options: {
      defaultExtractor: (content) => [
        ...(content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []),
        ...(content.match(/(?<=class:)[^=>\/\s]*/g) || [])
      ],
      safelist: [/^svelte-[\d\w]+$/]
    },
    theme: {
      letterSpacing: {
        widest: '2rem'
      },
      extend: {}
    },
    variants: {
      extend: {
        border: ['active', 'focus'],
        borderColor: ['active', 'focus', 'focus-visible']
      }
    },
    plugins: []
  }
};
