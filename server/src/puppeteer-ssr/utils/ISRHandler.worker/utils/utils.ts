import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
	getData as getDataCache,
	getStore as getStoreCache,
} from '../../../../api/utils/CacheManager/utils'
import Console from '../../../../utils/ConsoleHandler'
import { hashCode } from '../../../../utils/StringHelper'
import { IGetInternalHTMLParams, IGetInternalScriptParams } from './types'

export const getInternalScript = async (
	params: IGetInternalScriptParams
): Promise<{ body: Buffer | string; status: number } | undefined> => {
	if (!params) {
		Console.error('Need provide `params`')
		return
	}

	if (!params.url) {
		Console.error('Need provide `params.url`')
		return
	}

	const urlSplitted = params.url.split('/')
	const file = urlSplitted[urlSplitted.length - 1].split('?')[0]
	const filePath = resolve(__dirname, `../../../../../../dist/${file}`)

	try {
		const body = readFileSync(filePath)

		return {
			body,
			status: 200,
		}
	} catch (err) {
		Console.error(err)
		return {
			body: 'File not found',
			status: 404,
		}
	}
} // getInternalScript

export const getInternalHTML = async (params: IGetInternalHTMLParams) => {
	if (!params) {
		Console.error('Need provide `params`')
		return
	}

	if (!params.url) {
		Console.error('Need provide `params.url`')
		return
	}

	try {
		const filePath = resolve(__dirname, '../../../../../../dist/index.html')

		const apiStoreData = await (async () => {
			let tmpStoreKey
			let tmpAPIStore

			tmpStoreKey = hashCode(params.url)

			tmpAPIStore = await getStoreCache(tmpStoreKey)

			return tmpAPIStore?.data
		})()

		const WindowAPIStore = {}

		if (apiStoreData) {
			if (apiStoreData.length) {
				for (const cacheKey of apiStoreData) {
					const apiCache = await getDataCache(cacheKey)
					if (!apiCache || !apiCache.cache || apiCache.cache.status !== 200)
						continue

					WindowAPIStore[cacheKey] = apiCache.cache.data
				}
			}
		}

		let html = readFileSync(filePath, 'utf8') || ''

		html = html.replace(
			'</head>',
			`<script>window.API_STORE = ${JSON.stringify({
				WindowAPIStore,
			})}</script></head>`
		)

		return {
			body: html,
			status: 200,
		}
	} catch (err) {
		Console.error(err)
		return {
			body: 'File not found',
			status: 404,
		}
	}
} // getInternalHTML
