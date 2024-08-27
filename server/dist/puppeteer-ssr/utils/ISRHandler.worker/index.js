'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj }
}
function _optionalChain(ops) {
	let lastAccessLHS = undefined
	let value = ops[0]
	let i = 1
	while (i < ops.length) {
		const op = ops[i]
		const fn = ops[i + 1]
		i += 2
		if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) {
			return undefined
		}
		if (op === 'access' || op === 'optionalAccess') {
			lastAccessLHS = value
			value = fn(value)
		} else if (op === 'call' || op === 'optionalCall') {
			value = fn((...args) => value.call(lastAccessLHS, ...args))
			lastAccessLHS = undefined
		}
	}
	return value
}
var _path = require('path')
var _path2 = _interopRequireDefault(_path)
var _constants = require('../../../constants')
var _store = require('../../../store')
var _ConsoleHandler = require('../../../utils/ConsoleHandler')
var _ConsoleHandler2 = _interopRequireDefault(_ConsoleHandler)
var _WorkerManager = require('../../../utils/WorkerManager')
var _WorkerManager2 = _interopRequireDefault(_WorkerManager)
var _BrowserManager = require('../BrowserManager')
var _BrowserManager2 = _interopRequireDefault(_BrowserManager)

var _utils = require('../CacheManager.worker/utils')
var _utils2 = _interopRequireDefault(_utils)

const workerManager = _WorkerManager2.default.init(
	_path2.default.resolve(__dirname, `./worker.${_constants.resourceExtension}`),
	{
		minWorkers: 1,
		maxWorkers: 5,
	},
	['ISRHandler']
)

const browserManager = _BrowserManager2.default.call(
	void 0,
	() => `${_constants.userDataPath}/user_data_${Date.now()}`
)

const ISRHandler = async (params) => {
	if (!params.url) return

	const browser = await _optionalChain([
		browserManager,
		'optionalAccess',
		(_) => _.get,
		'call',
		(_2) => _2(),
	])

	if (!browser || !browser.connected) return

	const wsEndpoint = _optionalChain([
		_store.getStore.call(void 0, 'browser'),
		'optionalAccess',
		(_3) => _3.wsEndpoint,
	])

	if (!wsEndpoint) return

	const freePool = await workerManager.getFreePool({
		delay: 150,
	})
	const pool = freePool.pool

	const timeoutToCloseBrowserPage = setTimeout(() => {
		browser.emit('closePage', true)
	}, 30000)

	let result

	try {
		result = await new Promise(async (res, rej) => {
			let html
			const timeout = setTimeout(async () => {
				if (html) {
					const cacheManager = _utils2.default.call(void 0, params.url)
					const tmpResult = await cacheManager.set({
						html,
						url: params.url,
						isRaw: true,
					})

					res(tmpResult)
				} else {
					res(undefined)
				}
			}, 12000)
			try {
				const tmpResult = await pool.exec(
					'ISRHandler',
					[
						{
							...params,
							wsEndpoint,
						},
					],
					{
						on: (payload) => {
							if (!payload) return

							if (payload === 'closePage') {
								clearTimeout(timeoutToCloseBrowserPage)
								browser.emit('closePage', params.url.split('?')[0])
							} else if (
								typeof payload === 'object' &&
								payload.name === 'html' &&
								payload.value
							) {
								html = payload.value
							}
						},
					}
				)

				clearTimeout(timeout)
				res(tmpResult)
			} catch (err) {
				rej(err)
			}
		})
	} catch (err) {
		_ConsoleHandler2.default.error(err)
	}

	freePool.terminate({
		force: true,
		// delay: 30000,
	})

	return result
} // getData

exports.default = ISRHandler
