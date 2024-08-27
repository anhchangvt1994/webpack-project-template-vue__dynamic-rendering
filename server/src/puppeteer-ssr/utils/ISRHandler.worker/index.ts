import path from 'path'
import { resourceExtension, userDataPath } from '../../../constants'
import { getStore } from '../../../store'
import Console from '../../../utils/ConsoleHandler'
import WorkerManager from '../../../utils/WorkerManager'
import BrowserManager from '../BrowserManager'
import { type IISRHandlerWorkerParam } from './types'
import { ISSRResult } from '../../types'
import CacheManager from '../CacheManager.worker/utils'

const workerManager = WorkerManager.init(
	path.resolve(__dirname, `./worker.${resourceExtension}`),
	{
		minWorkers: 1,
		maxWorkers: 5,
	},
	['ISRHandler']
)

const browserManager = BrowserManager(
	() => `${userDataPath}/user_data_${Date.now()}`
)

const ISRHandler = async (params: IISRHandlerWorkerParam) => {
	if (!params.url) return

	const browser = await browserManager?.get()

	if (!browser || !browser.connected) return

	const wsEndpoint = getStore('browser')?.wsEndpoint

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
					const cacheManager = CacheManager(params.url)
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
		Console.error(err)
	}

	freePool.terminate({
		force: true,
		// delay: 30000,
	})

	return result
} // getData

export default ISRHandler
