import { ServerStore } from 'store/ServerStore'
import { resetSeoTag } from 'utils/SeoHelper'
import { RouteLocationNormalized, Router } from 'vue-router'

interface IFetchOnRouteResponse {
	originPath: string
	path: string
	search: string | undefined
	status: number
}

const fetchOnRoute = (() => {
	let controller

	return async (
		path: string,
		init?: RequestInit | undefined
	): Promise<undefined | IFetchOnRouteResponse> => {
		if (!path) return

		controller?.abort('reject')
		controller = new AbortController()

		const data = await new Promise(async (res) => {
			setTimeout(() => {
				controller?.abort('reject')
				res(null)
			}, 5000)

			const response = await fetch(path, {
				...init,
				signal: controller.signal,
			}).then((res) => res.text())

			res(/^{(.|[\r\n])*?}$/.test(response) ? JSON.parse(response) : {})
		})

		return data as IFetchOnRouteResponse
	}
})() // fetchOnRoute

const SUCCESS_CODE_LIST = [200]
const REDIRECT_CODE_LIST = [301, 302]
const ERROR_CODE_LIST = [404, 500, 502, 504]

let prevPath = ''
const validPathListCached = new Map<
	string,
	{
		status: number
		path: string
	}
>()

interface IServerRouterHandler {
	redirectPath?: string
	status: number
}

const ServerRouterHandler = (() => {
	return async (
		router: Router,
		to: RouteLocationNormalized,
		from: RouteLocationNormalized
	): Promise<IServerRouterHandler> => {
		const locale = to.params.locale || ''
		const enableLocale = Boolean(
			LocaleInfo.langSelected || LocaleInfo.countrySelected
		)
		const curLocale = getLocale(
			LocaleInfo.langSelected,
			LocaleInfo.countrySelected
		)

		const validPathInfo = (() => {
			let tmpValidPathInfo

			tmpValidPathInfo = validPathListCached.get(to.path)

			if (tmpValidPathInfo) return tmpValidPathInfo
			tmpValidPathInfo = validPathListCached.get(
				to.path.replace(new RegExp(`^(\/|)${locale}`), '') || '/'
			)

			return tmpValidPathInfo
		})()

		if (!BotInfo.isBot && !validPathInfo) {
			const fullPath = `${to.fullPath}${
				to.fullPath.includes('?') ? '&key=' : '?key='
			}${Date.now()}`
			const res = await fetchOnRoute(fullPath, {
				headers: new Headers({
					Accept: 'application/json',
				}),
			})

			if (enableLocale) {
				ServerStore.reInit.LocaleInfo()
			}

			if (res) {
				const curLocale = getLocale(
					LocaleInfo.langSelected,
					LocaleInfo.countrySelected
				)

				if (
					REDIRECT_CODE_LIST.includes(res.status) ||
					(SUCCESS_CODE_LIST.includes(res.status) && locale === curLocale)
				) {
					if (
						!(location.search && res.search) ||
						location.search === res.search
					) {
						validPathListCached.set(
							res.originPath?.replace(new RegExp(`^(\/|)${curLocale}`), '') ||
								'/',
							{
								status: SUCCESS_CODE_LIST.includes(res.status)
									? 301
									: res.status,
								path:
									res.path?.replace(new RegExp(`^(\/|)${curLocale}`), '') ||
									'/',
							}
						)
					}

					if (REDIRECT_CODE_LIST.includes(res.status))
						return {
							redirectPath: res.path + res.search,
							status: res.status,
						}
				} else {
					const tmpPath = location.pathname.replace(`/${curLocale}`, '') || '/'
					validPathListCached.set(tmpPath, {
						status: res.status,
						path: tmpPath,
					})

					resetSeoTag()
				}
			}
		} else if (
			enableLocale &&
			validPathInfo &&
			locale !== curLocale &&
			to.path.replace(new RegExp(`^(\/|)${locale}|\/{0,}$`, 'g'), '') ===
				prevPath.replace(new RegExp(`^(\/|)${curLocale}|\/{0,}$`, 'g'), '')
		) {
			const arrLocale = to.path.split('/')[1]?.split('-')

			if (arrLocale?.length) {
				const cookies = getCookie('LocaleInfo')
				if (LocaleInfo.defaultLang) setCookie('lang', arrLocale[0])
				if (LocaleInfo.defaultCountry)
					setCookie(
						'country',
						LocaleInfo.defaultLang ? arrLocale[1] : arrLocale[0]
					)

				const objCookies = cookies ? JSON.parse(cookies) : LocaleInfo
				objCookies.langSelected = getCookie('lang')
				objCookies.countrySelected = getCookie('country')
				setCookie('LocaleInfo', JSON.stringify(objCookies))

				ServerStore.reInit.LocaleInfo()
			}
		} else if (
			enableLocale &&
			validPathInfo &&
			validPathInfo.status !== 200 &&
			(!to.path.startsWith(`/${curLocale}`) ||
				to.path.replace(`/${curLocale}`, '') === '/' ||
				(to.path.replace(`/${curLocale}`, '') || '/') !== validPathInfo.path)
		) {
			// console.log('change local with cache')
			const search = to.fullPath.split('?')[1]

			return {
				redirectPath: `/${curLocale}${
					validPathInfo.path === '/' ? '' : validPathInfo.path
				}${search ? '?' + search : ''}`,
				status: 301,
			}
		} else if (!to.path.startsWith(to.path)) {
			resetSeoTag()
		}

		prevPath = to.path

		return { status: 200 }
	}
})()

export default ServerRouterHandler
