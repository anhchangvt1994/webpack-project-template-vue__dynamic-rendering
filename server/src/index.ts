import { spawn } from 'child_process'
import chokidar from 'chokidar'
import cors from 'cors'
import express from 'express'
import path from 'path'
import { findFreePort, getPort, setPort } from '../../config/utils/PortHandler'
import { ENV, pagesPath } from './constants'
import puppeteerSSRService from './puppeteer-ssr'
import { COOKIE_EXPIRED } from './puppeteer-ssr/constants'
import ServerConfig from './server.config'
import Console from './utils/ConsoleHandler'
import { setCookie } from './utils/CookieHandler'
import detectBot from './utils/DetectBot'
import detectDevice from './utils/DetectDevice'
import detectLocale from './utils/DetectLocale'
import DetectRedirect from './utils/DetectRedirect'
import detectStaticExtension from './utils/DetectStaticExtension'

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

	const app = express()
	const server = require('http').createServer(app)

	app
		.use(cors())
		.use(
			'/robots.txt',
			express.static(path.resolve(__dirname, '../robots.txt'))
		)
		.use(function (req, res, next) {
			const isStatic = detectStaticExtension(req)
			/**
			 * NOTE
			 * Cache-Control max-age is 1 year
			 * calc by using:
			 * https://www.inchcalculator.com/convert/month-to-second/
			 */
			if (isStatic) {
				if (ENV !== 'development') {
					res.set('Cache-Control', 'public, max-age=31556952')
				}

				try {
					res
						.status(200)
						.sendFile(path.resolve(__dirname, `../../dist/${req.url}`))
				} catch (err) {
					res.status(404).send('File not found')
				}
			} else {
				next()
			}
		})
		.use(function (req, res, next) {
			if (!process.env.BASE_URL)
				process.env.BASE_URL = `${req.protocol}://${req.get('host')}`
			next()
		})
		.use(function (req, res, next) {
			let botInfo
			if (req.headers.service === 'puppeteer') {
				botInfo = req.headers['bot_info'] || ''
			} else {
				botInfo = JSON.stringify(detectBot(req))
			}

			setCookie(res, `BotInfo=${botInfo};Max-Age=${COOKIE_EXPIRED_SECOND}`)
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
					res.end(JSON.stringify(redirectInfo))
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
				deviceInfo = JSON.stringify(detectDevice(req))
			}

			setCookie(
				res,
				`DeviceInfo=${deviceInfo};Max-Age=${COOKIE_EXPIRED_SECOND}`
			)
			next()
		})
	;(await puppeteerSSRService).init(app)

	server.listen(port, () => {
		Console.log('Server started. Press Ctrl+C to quit')
		process.send?.('ready')
	})

	process.on('SIGINT', async function () {
		await server.close()
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
			await server.close()
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
