const tsParser = require('@typescript-eslint/parser');
const tsEslint = require('@typescript-eslint/eslint-plugin');
const prettier = require('eslint-plugin-prettier');
const securityNode = require('eslint-plugin-security-node');
const path = require('path');

const config = [
  {
    files: ['**/*.ts'],
    ignores: ['.eslintrc.js'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint,
      prettier,
      'security-node': securityNode,
    },
    rules: {
      ...tsEslint.configs.recommended.rules,
      ...prettier.configs.recommended.rules,
      ...securityNode.configs.recommended.rules,
      'security-node/detect-child-process': 'error',

      // TypeScript Rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-misused-promises': 'error',

      // Prettier Rules
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 80,
          tabWidth: 2,
          semi: true,
          arrowParens: 'always',
          endOfLine: 'lf',
          bracketSpacing: true,
        },
      ],

      // General Rules
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
];

module.exports = config;
