const { eslint } = require('@honeybdg/codestyle');
/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...eslint,
  {
    rules: {
      'react/prop-types': 'off',
    },
  },
];
