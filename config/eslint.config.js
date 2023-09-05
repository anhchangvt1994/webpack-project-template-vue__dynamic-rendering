module.exports = {
	root: true,
	ignorePatterns: ['webpack.config.js', 'env/**/*', 'config/**/*', 'dist/**/*'],
	env: {
		browser: true,
		es6: true,
		// jest: true,
		node: true,
	},
	extends: [
		'.eslintrc-auto-import.json',
		'plugin:vue/vue3-recommended',
		'plugin:@typescript-eslint/recommended',
		'eslint:recommended',
		'@vue/typescript/recommended',
		'@vue/eslint-config-prettier',
		'@vue/eslint-config-typescript',
		'plugin:prettier/recommended',
		'plugin:import/recommended',
		'plugin:import/typescript',
		'plugin:import/errors',
		'plugin:import/warnings',
		'prettier',
	],
	plugins: ['@typescript-eslint/eslint-plugin'],
	parser: 'vue-eslint-parser',
	parserOptions: {
		parser: {
			js: 'espree',
			jsx: 'espree',
			ts: '@typescript-eslint/parser',
			tsx: '@typescript-eslint/parser',
			'<template>': 'espree',
		},
		ecmaFeatures: {
			jsx: true,
			tsx: true,
		},
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: './tsconfig.json',
	},
	rules: {
		'linebreak-style': 'off',
		'prettier/prettier': [
			'error',
			{
				endOfLine: 'auto',
			},
		],
		'@typescript-eslint/naming-convention': 'off',
		'no-unused-vars': 'warn',
		'vue/multi-word-component-names': 'off',
		'vue/no-undef-components': [
			'error',
			{
				ignorePatterns: ['router(\\-\\w+)+'],
			},
		],
	},
	settings: {
		'import/resolver': {
			'eslint-import-resolver-custom-alias': {
				alias: {
					'': './src',
				},
				extensions: ['.js', '.jsx', '.vue', '.ts', '.tsx'],
			},
		},
	},
}
