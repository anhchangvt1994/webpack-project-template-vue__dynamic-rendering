import { spawn } from 'child_process'
import chokidar from 'chokidar'
import cors from 'cors'
import fastify from 'fastify'
import middie from '@fastify/middie'
import serveStatic from 'serve-static'
import path from 'path'
import { findFreePort, getPort, setPort } from '../../config/utils/PortHandler'
import { ENV, pagesPath } from './constants'
import puppeteerSSRService from './puppeteer-ssr/index.fastify'
import Console from './utils/ConsoleHandler'
import detectBot from './utils/DetectBot'
import detectDevice from './utils/DetectDevice'
import detectStaticExtension from './utils/DetectStaticExtension'
import DetectRedirect from './utils/DetectRedirect'
import sendFile from './utils/SendFile'
import { COOKIE_EXPIRED } from './puppeteer-ssr/constants'
import { setCookie } from './utils/CookieHandler'
import detectLocale from './utils/DetectLocale'
import ServerConfig from './server.config'

const COOKIE_EXPIRED_SECOND = COOKIE_EXPIRED / 1000

require('events').EventEmitter.setMaxListeners(200)

const cleanResourceWithCondition = async () => {
	if (process.env.ENV === 'development') {
		// NOTE - Clean Browsers and Pages after start / restart
		const {
			deleteResource,
		} = require('./puppeteer-ssr/utils/FollowResource.worker/utils.ts')
		const browsersPath = path.resolve(__dirname, './puppeteer-ssr/browsers')

		return Promise.all([
			deleteResource(browsersPath),
			deleteResource(pagesPath),
		])
	}
}

const startServer = async () => {
	await cleanResourceWithCondition()
	let port = getPort('PUPPETEER_SSR_PORT')
	port = await findFreePort(port || process.env.PUPPETEER_SSR_PORT || 8080)
	setPort(port, 'PUPPETEER_SSR_PORT')

	const app = fastify()

	await app.register(middie, {
		hook: 'onRequest', // default
	})

	app
		.use(cors())
		.use('/robots.txt', serveStatic(path.resolve(__dirname, '../robots.txt')))
		.use(async function (req, res, next) {
			const isStatic = detectStaticExtension(req as any)
			/**
			 * NOTE
			 * Cache-Control max-age is 1 year
			 * calc by using:
			 * https://www.inchcalculator.com/convert/month-to-second/
			 */

			if (isStatic) {
				const filePath = path.resolve(__dirname, `../../dist/${req.url}`)

				if (ENV !== 'development') {
					res.setHeader('Cache-Control', 'public, max-age=31556952')
				}

				sendFile(filePath, res)
			} else {
				next()
			}
		})
		.use(function (req, res, next) {
			if (!process.env.BASE_URL)
				process.env.BASE_URL = `${req.protocol}://${req.hostname}`
			next()
		})
		.use(function (req, res, next) {
			let botInfo
			if (req.headers.service === 'puppeteer') {
				botInfo = req.headers['bot_info'] || ''
			} else {
				botInfo = JSON.stringify(detectBot(req as any))
			}

			setCookie(
				res,
				`BotInfo=${botInfo};Max-Age=${COOKIE_EXPIRED_SECOND};Path=/`
			)
			next()
		})
		.use(function (req, res, next) {
			const localeInfo = detectLocale(req)
			const enableLocale =
				ServerConfig.locale.enable &&
				Boolean(
					!ServerConfig.locale.routes ||
						!ServerConfig.locale.routes[req.url as string] ||
						ServerConfig.locale.routes[req.url as string].enable
				)

			setCookie(
				res,
				`LocaleInfo=${JSON.stringify(
					localeInfo
				)};Max-Age=${COOKIE_EXPIRED_SECOND};Path=/`
			)

			if (enableLocale) {
				setCookie(
					res,
					`lang=${
						localeInfo?.langSelected ?? ServerConfig.locale.defaultLang
					};Path=/`
				)

				if (ServerConfig.locale.defaultCountry) {
					setCookie(
						res,
						`country=${
							localeInfo?.countrySelected ?? ServerConfig.locale.defaultCountry
						};Path=/`
					)
				}
			}
			next()
		})
		.use(function (req, res, next) {
			const redirectInfo = DetectRedirect(req, res)

			if (redirectInfo.statusCode !== 200) {
				if (req.headers.accept === 'application/json') {
					res
						.setHeader('Cache-Control', 'no-store')
						.end(JSON.stringify(redirectInfo))
				} else {
					if (redirectInfo.redirectUrl.length > 1)
						redirectInfo.redirectUrl = redirectInfo.redirectUrl.replace(
							/\/$|\/(\?)/,
							'$1'
						)
					res.writeHead(redirectInfo.statusCode, {
						Location: redirectInfo.redirectUrl,
						'cache-control': 'no-store',
					})
					res.end()
				}
			} else next()
		})
		.use(function (req, res, next) {
			let deviceInfo
			if (req.headers.service === 'puppeteer') {
				deviceInfo = req.headers['device_info'] || ''
			} else {
				deviceInfo = JSON.stringify(detectDevice(req as any))
			}

			setCookie(
				res,
				`DeviceInfo=${deviceInfo};Max-Age=${COOKIE_EXPIRED_SECOND};Path=/`
			)
			next()
		})
	;(await puppeteerSSRService).init(app)

	app.listen(
		{
			port,
		},
		() => {
			Console.log('Server started. Press Ctrl+C to quit')
			process.send?.('ready')
		}
	)

	process.on('SIGINT', async function () {
		await app.close()
		process.exit(0)
	})

	if (process.env.ENV === 'development') {
		// NOTE - restart server onchange
		const watcher = chokidar.watch([path.resolve(__dirname, './**/*.ts')], {
			ignored: /$^/,
			persistent: true,
		})

		watcher.on('change', async (path) => {
			Console.log(`File ${path} has been changed`)
			await app.close()
			setTimeout(() => {
				spawn(
					'node',
					['--require', 'sucrase/register', 'server/src/index.ts'],
					{
						stdio: 'inherit',
						shell: true,
					}
				)
			})
			process.exit(0)
		})
	}
}

startServer()
