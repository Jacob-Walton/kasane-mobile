const expo = require('eslint-config-expo/flat');

module.exports = [
  ...expo,
  { ignores: ['node_modules/**', '.expo/**', 'theme.ts', 'proxy.mjs'] },
];
