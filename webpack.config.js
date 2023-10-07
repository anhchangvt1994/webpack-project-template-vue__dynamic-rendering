const path = require('path')
const fs = require('fs')
const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const PROJECT_PATH = __dirname.replace(/\\/g, '/')

const resolve =
	resolveTsconfigPathsToAlias(path.resolve(PROJECT_PATH, 'tsconfig.json')) || {}

module.exports = async (env, arg) => {
	const WebpackConfigWithMode = await require(getWebpackConfigFilePathWithMode(
		arg.mode
	))

	if (!WebpackConfigWithMode) return

	return {
		mode: WebpackConfigWithMode.mode || arg.mode || 'production',
		context: path.resolve(__dirname, '.'),
		entry: {
			app: {
				import: '/src/App.ts',
			},
			...(WebpackConfigWithMode.entry || {}),
		},
		output: {
			pathinfo: false,
			globalObject: 'globalThis',
			filename: '[contenthash:8].js',
			assetModuleFilename: '[file]',
			path: path.resolve(__dirname, 'dist'),
			...(WebpackConfigWithMode.output || {}),
		},
		externalsType: WebpackConfigWithMode.externalsType || 'var',
		externals: WebpackConfigWithMode.externals || {},
		resolve: {
			preferRelative: true,
			alias: {
				...resolve.alias,
				...(WebpackConfigWithMode.resolve?.alias ?? {}),
			},
			extensions: ['.ts', '.scss', '.js', '.vue'],
			modules: [
				'node_modules',
				path.resolve(__dirname, './node_modules'),
				...resolve.modules,
			],
		},
		devtool: WebpackConfigWithMode.devtool || false,
		devServer: WebpackConfigWithMode.devServer || {},
		module: {
			rules: [
				{
					test: /\.vue$/,
					loader: 'vue-loader',
				},
				{
					test: /\.((c|sa|sc)ss)$/i,
					use: [
						{
							// NOTE - We should use option 1 because if we use 'style-loader' then the import .css will be replace by <style></style> of sfc vue compiler
							// NOTE - Option 2
							// loader: "style-loader",

							// NOTE - Option 1
							loader: MiniCssExtractPlugin.loader,
						},
						{
							loader: 'css-loader',
							options: {
								url: false,
							},
						},
						{
							loader: 'postcss-loader',
							options: {
								postcssOptions: {
									plugins: [
										'postcss-preset-env',
										'autoprefixer',
										require('tailwindcss')(
											PROJECT_PATH + '/tailwind.config.js'
										),
									],
								},
							},
						},
						{
							loader: 'sass-loader',
							options: {
								additionalData: '@import "main.scss";',
								sassOptions: {
									hmr: true,
									includePaths: [
										'node_modules',
										'src/assets',
										'src/assets/styles',
										'src/assets/fonts',
										'src/assets/images',
										'src/assets/videos',
										'src/assets/styles/layout',
									],
									sourceMap: arg.mode === 'development',
									warnRuleAsWarning: true,
								},
							},
						},
					],
				},
				// NOTE - This config to resolve asset's paths
				{
					test: /\.(png|jpe?g|gif|webm|mp4|svg|ico|tff|eot|otf|woff|woff2)$/,
					type: 'asset/resource',
					generator: {
						emit: false,
					},
					exclude: [/node_modules/],
				},
				...(WebpackConfigWithMode?.module?.rules ?? []),
			],
			unsafeCache: true,
			noParse: /[\\/]src\/assets\/static[\\/]|libs[\\/]socket.io.min.js/,
		},
		plugins: [
			new CleanWebpackPlugin(),
			new CopyPlugin({
				patterns: [
					{
						from: './src/assets/static',
						filter: (resourcePath) => {
							if (
								arg.mode === 'production' &&
								resourcePath.indexOf('images/development') !== -1
							) {
								return false
							}

							return true
						},
					},
				],
			}),
			new MiniCssExtractPlugin({
				filename:
					arg.mode === 'development'
						? '[id].css'
						: '[name].[contenthash:8].css',
				chunkFilename:
					arg.mode === 'development' ? '[id].css' : '[id].[contenthash:8].css',
				ignoreOrder: false,
				experimentalUseImportModule: true,
			}),
			new VueLoaderPlugin(),
			require('unplugin-auto-import/webpack')({
				// targets to transform
				include: [
					/\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
					/\.vue$/,
					/\.vue\?vue/, // .vue
					/\.md$/, // .md
				],
				imports: [
					// presets
					'vue',
					{
						'vue-router': [
							'createRouter',
							'createWebHistory',
							'useRoute',
							'useRouter',
						],
						'utils/StringHelper.ts': [
							'getSlug',
							'getSlugWithoutDash',
							'getUnsignedLetters',
							'getCustomSlug',
							'generateTitleCase',
							'generateSentenceCase',
							'getLocale',
						],
						'composable/useStringHelper.ts': [
							'useSlug',
							'useSlugWithoutDash',
							'useUnsignedLetters',
							'useTitleCase',
							'useSentenceCase',
						],
						'utils/SeoHelper/index.ts': [
							'setTitleTag',
							'setMetaDescriptionTag',
							'setMetaKeywordsTag',
							'setMetaRobotsTag',
							'setLinkCanonicalTag',
							'setMetaViewportTag',
							'setMetaOgTitleTag',
							'setMetaOgDescriptionTag',
							'setMetaOgImageTag',
							'setMetaOgUrlTag',
							'setMetaOgTypeTag',
							'setMetaOgSiteNameTag',
							'setMetaAuthorTag',
							'setMetaGoogleBotTag',
							'setMetaGoogleSiteVerificationTag',
							'setLinkAlternateTag',
							'setMetaGeoRegionTag',
							'setMetaGeoPositionTag',
							'setMetaICBMTag',
							'setLinkNextTag',
							'setLinkPrevTag',
							'setLinkAuthorTag',
							'setLinkAmphtmlTag',
							'setLinkTwitterTitleTag',
							'setMetaTwitterDescriptionTag',
							'setMetaTwitterImageTag',
							'setMetaTwitterCardTag',
							'setSeoTag',
						],
						'store/ServerStore.ts': ['BotInfo', 'DeviceInfo', 'LocaleInfo'],
						'utils/CookieHelper.ts': ['getCookie', 'setCookie'],
					},
				],
				dts: PROJECT_PATH + '/config/auto-imports.d.ts',
				vueTemplate: true,
				eslintrc: {
					enabled: true,
					filepath: PROJECT_PATH + '/config/.eslintrc-auto-import.json',
				},
			}),
			...(WebpackConfigWithMode.plugins || []),
		],
		stats: WebpackConfigWithMode.stats || 'detailed',
		cache: WebpackConfigWithMode.cache || true,
		optimization: WebpackConfigWithMode.optimization || {},
		experiments: WebpackConfigWithMode.experiments || {},
		target: WebpackConfigWithMode.target || 'web',
		node: WebpackConfigWithMode.node || {},
	}
}

/**
 * Libs inline support for webpack config
 */
const getWebpackConfigFilePathWithMode = (mode) => {
	if (!mode) return

	return mode === 'development'
		? './config/webpack.development.config.js'
		: './config/webpack.production.config'
} // getWebpackConfigFilePathWithMode(mode?: 'development' | 'production')

function resolveTsconfigPathsToAlias(tsconfigPath = './tsconfig.json') {
	// const tsconfig = require(tsconfigPath)
	// const { paths, baseUrl } = tsconfig.compilerOptions
	// NOTE - Get json content without comment line (ignore error JSON parse some string have unexpected symbol)
	// https://stackoverflow.com/questions/40685262/read-json-file-ignoring-custom-comments
	const tsconfig = JSON.parse(
		fs
			.readFileSync(tsconfigPath)
			?.toString()
			.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) =>
				g ? '' : m
			)
	)
	const { paths, baseUrl } = tsconfig.compilerOptions

	const modules = [path.resolve(__dirname, baseUrl)]

	const alias = Object.fromEntries(
		Object.entries(paths)
			.filter(([, pathValues]) => pathValues.length > 0)
			.map(([pathKey, pathValues]) => {
				const key = pathKey.replace('/*', '')
				const value = path.resolve(
					__dirname,
					baseUrl,
					pathValues[0].replace(/[\/|\*]+(?:$)/g, '')
				)
				modules.push(value)
				return [key, value]
			})
	)

	return {
		alias: {
			src: path.resolve(__dirname, baseUrl),
			...alias,
		},
		modules,
	}
} // resolveTsconfigPathsToAlias()
