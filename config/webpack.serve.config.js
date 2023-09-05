const { webpack } = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const { getPort, findFreePort } = require('./utils/PortHandler')

;(async () => {
	const puppeteerSSRPort = getPort('PUPPETEER_SSR_PORT') || 8080
	const port = await findFreePort(process.env.PORT)
	const serverInitial = new WebpackDevServer(
		webpack({
			mode: 'development',
			entry: {},
			output: {},
		}),
		{
			compress: true,
			port: port,
			static: './dist',
			historyApiFallback: true,
			devMiddleware: { index: false },
			proxy: {
				context: (url, req) => !/.js.map|favicon.ico/g.test(url),
				target: `http://localhost:${puppeteerSSRPort}`,
			},
		}
	)

	serverInitial.start()
})()
