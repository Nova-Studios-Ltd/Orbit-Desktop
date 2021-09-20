module.exports = {
  extends: 'erb',
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'react/self-closing-comp': 'off',
    'react/prefer-stateless-function': 'off',
    'jsx-a11y/alt-text': 'warn',
    'react/button-has-type': 'off',
    'max-classes-per-file': 'off',
    'prettier/prettier': 'off',
    '@typescript-eslint/ban-types': 'warn',
    'no-console': 'off',
    'react/jsx-curly-brace-presence': 'off',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.js'),
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
