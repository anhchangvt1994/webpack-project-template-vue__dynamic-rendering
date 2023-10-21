import type { IUserInfo } from 'store/UserStore'
import { UserInfoState } from 'store/UserStore'
import { resetSeoTag } from 'utils/SeoHelper'
import type { RouteLocationNormalized, Router } from 'vue-router'
import LocaleHandler from './LocaleHandler'

interface INavigate {
	error?: string
	status: 200 | 301 | 302 | 404 | 504
	redirect?: string | number
}

interface INavigateInfo {
	to: RouteLocationNormalized
	from: RouteLocationNormalized
}

export interface ICertInfo {
	user: IUserInfo
	navigateInfo: INavigateInfo
	successPath: string
}

const fetchOnRoute = (() => {
	let controller

	return async (
		to: RouteLocationNormalized,
		init?: RequestInit | undefined
	): Promise<undefined | { statusCode: number; redirectUrl?: string }> => {
		if (!to) return

		controller?.abort('reject')
		controller = new AbortController()

		const data = await new Promise(async (res) => {
			setTimeout(res, 1000)
			const response = await fetch(to.path, {
				...init,
				signal: controller.signal,
			}).then((res) => res.text())

			res(/^{(.|[\r\n])*?}$/.test(response) ? JSON.parse(response) : {})
		})

		return data as { statusCode: number; redirectUrl?: string }
	}
})() // fetchOnRoute

const VALID_CODE_LIST = [200]
const REDIRECT_CODE_LIST = [301, 302]
const ERROR_CODE_LIST = [404, 500, 502, 504]

const BeforeEach = (function beforeEach() {
	let successPath: string
	let successID: string
	let WAITING_VERIFY_ROUTER_NAME_LIST: { [key: string]: Array<string> }

	const _init = (router: Router) => {
		router.beforeEach(async (to, from) => {
			const enableLocale =
				to.params.locale !== undefined &&
				(LocaleInfo.langSelected || LocaleInfo.countrySelected)

			if (enableLocale) {
				const redirect = await LocaleHandler(router, to, from)

				if (redirect) {
					router.push(redirect)
					return true
				}
			} else if (window.location.pathname !== to.path) {
				// NOTE - Handle pre-render for bot with locale options turned off
				const data = await fetchOnRoute(to, {
					method: 'GET',
					headers: new Headers({
						Accept: 'application/json',
					}),
				})

				if (data) {
					if (REDIRECT_CODE_LIST.includes(data.statusCode)) {
						router.push({
							path: data.redirectUrl,
							replace: false,
						})

						return false
					} else if (ERROR_CODE_LIST.includes(data.statusCode)) return false
				}
			}

			const curLocale = getLocale(
				LocaleInfo.langSelected,
				LocaleInfo.countrySelected
			)

			resetSeoTag()

			if (typeof to.meta.protect === 'function') {
				const protect = to.meta.protect
				const navigate: INavigate = {
					status: 200,
				}

				const certificateInfo: ICertInfo = {
					user: UserInfoState as IUserInfo,
					navigateInfo: {
						to,
						from,
					},
					successPath,
				}

				const checkProtection = (isReProtect = false) => {
					const protectInfo = protect(certificateInfo)

					if (!protectInfo) {
						navigate.status = 301
						navigate.redirect = -1
					} else if (typeof protectInfo === 'string') {
						if (WAITING_VERIFY_ROUTER_NAME_LIST[to.name as string]) {
							successPath = to.fullPath as string
							successID = to.name as string
						}

						navigate.status = 301
						navigate.redirect = protectInfo
					}

					if (navigate.status !== 200) {
						const redirect = navigate.redirect || -1

						if (redirect === -1) {
							router.go(redirect)
						} else {
							router.push({
								path: navigate.redirect as string,
								params: {
									locale: curLocale,
								},
								// replace: navigate.status === 301,
								replace: isReProtect,
							})
						}

						return false
					}

					return true
				}

				to.meta.reProtect = () => checkProtection(true)

				if (!checkProtection()) return false
			}

			if (
				successID &&
				!WAITING_VERIFY_ROUTER_NAME_LIST[successID].includes(to.name as string)
			) {
				successID = ''
				successPath = ''
			}

			return true
		})
	}

	return {
		init(
			router: Router,
			waitingVerifyRouterNameList: { [key: string]: Array<string> }
		) {
			try {
				if (!router) {
					throw Object.assign(new Error('Missing router parameter!'), {
						code: 402,
					})
				} else {
					WAITING_VERIFY_ROUTER_NAME_LIST = waitingVerifyRouterNameList
					_init(router)
				}
			} catch (err) {
				console.error(err)
			}
		},
	}
})()

export default BeforeEach
