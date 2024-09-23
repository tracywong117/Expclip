module.exports = {
    purge: {
      content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
      safelist: [
        // Custom purple shades
        'border-yellow-400', 'bg-yellow-50',
        'border-red-400', 'bg-red-50',
        'border-pink-400', 'bg-pink-50',
        'border-blue-400', 'bg-blue-50',
        'border-green-400', 'bg-green-50',
        'border-orange-400', 'bg-orange-50',
        'border-gray-400', 'bg-gray-50',
        'border-purple-400', 'bg-purple-50',
      ],
    },
    darkMode: false, // or 'media' or 'class'
    theme: {
      extend: {
        colors: {
          customPurple: {
            100: '#fcf8ff',
            200: '#f9f0fd',
            300: '#f6f0fd',
            400: '#e5d4f3',
            500: '#d4b8e9',
            600: '#b290ce',
            700: '#9d7bb5',
            800: '#88669c',
            900: '#735183',
          },
        },
      },
    },
    variants: {
      extend: {},
    },
    plugins: [],
  }