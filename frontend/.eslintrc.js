module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': [
      'warn',
      { vars: 'all', args: 'after-used', ignoreRestSiblings: false },
    ],
  },
};
