const { eslint } = require('@honeybdg/codestyle');
/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...eslint,
  {
    ignores: [
      'dist/',
      'lib/',
    ],
  },
  {
    rules: {
      'react/prop-types': 'off',
    },
  },
];
