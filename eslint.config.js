import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        ignores: [
            'dist/',
            'build/',
            'out/',
            'node_modules/',
            '.vite/',
            'coverage/',
        ],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
                project: false, // set to true with a tsconfig if you want type-aware rules
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            react: reactPlugin,
            'react-hooks': reactHooks,
            'jsx-a11y': jsxA11y,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...reactPlugin.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            ...tsPlugin.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off', // not needed with React 17+
            'react/jsx-uses-react': 'off',
            // Example stricter rules (tweak to taste):
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        },
        settings: {
            react: { version: 'detect' },
        },
    },
];