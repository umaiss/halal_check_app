module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser', // Add TS parser
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    project: './tsconfig.json', // Needed for some TS rules
  },
  extends: [
    'airbnb',
    'airbnb/hooks',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:@typescript-eslint/recommended', // Add TS rules
    '@react-native',
  ],
  plugins: ['react', 'react-native', 'react-hooks', '@typescript-eslint'],
  rules: {
    // Your existing rule
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],

    // React rules
    'react/react-in-jsx-scope': 'off', // Not needed in RN / React 17+
    'react/prop-types': 'off', // We use TypeScript for props
    'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],

    // Airbnb adjustments
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'] },
    ],

    // React Native specific
    'react-native/no-inline-styles': 'warn',
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'warn',
    'react-native/no-color-literals': 'off',
    'react-native/sort-styles': 'off',
    'react-native/no-raw-text': [
      'error',
      {
        skip: ['SmallText', 'MediumText', 'LargeText', 'UnderLineText', 'Button'],
      },
    ],

    // TypeScript rules
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/explicit-function-return-type': 'off',

    // React/JSX rules
    'react/require-default-props': 'off',
    'react/function-component-definition': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-array-index-key': 'off',

    // General
    'no-console': 'warn',
    'no-param-reassign': 'off',
    'import/no-unresolved': 'off',
  },
  ignorePatterns: ['.eslintrc.js', 'metro.config.js', 'lint_output.txt'],
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      'react-native': {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
