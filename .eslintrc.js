module.exports = {
  extends: [
    'erb/typescript',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./configs/webpack.config.eslint.js'),
      },
    },
  },
  parserOptions: {
    tsConfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
};
