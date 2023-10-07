import type { Router, RouteLocationNormalized } from 'vue-router'
import type { IUserInfo } from 'store/UserStore'
import { UserInfoState } from 'store/UserStore'
import { resetSeoTag } from 'utils/SeoHelper'
import { ServerStore } from 'store/ServerStore'

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

const BeforeEach = (function beforeEach() {
	let successPath: string
	let successID: string
	let WAITING_VERIFY_ROUTER_NAME_LIST: { [key: string]: Array<string> }

	const _init = (router: Router) => {
		router.beforeEach(async (to, from) => {
			let curLocale
			if (LocaleInfo.langSelected || LocaleInfo.countrySelected) {
				// NOTE - Handle for change locale case
				if (
					from.meta.lang &&
					to.params.locale &&
					to.params.locale !== getLocale(from.meta.lang, from.meta.country)
				) {
					const [lang, country] = (to.params.locale as string).split('-')
					setCookie('lang', lang)

					if (LocaleInfo.defaultCountry) setCookie('country', country)

					ServerStore.reInit.LocaleInfo()
				}

				const defaultLocale = getLocale(
					LocaleInfo.defaultLang,
					LocaleInfo.defaultCountry
				)
				curLocale = getLocale(
					LocaleInfo.langSelected,
					LocaleInfo.countrySelected
				)

				// NOTE - Handle for hidden default locale params
				if (to.params.locale && to.params.locale !== curLocale) {
					router.push({
						path: `/${curLocale}${to.fullPath}`,
						replace: true,
					})
					return false
				} else if (
					LocaleInfo.hideDefaultLocale &&
					curLocale === defaultLocale &&
					to.path.includes(`/${curLocale}`)
				) {
					const path = to.fullPath.replace(`/${curLocale}`, '')
					router.push({
						path: path ? path : '/',
						name: to.name as string,
						params: {
							...to.params,
							locale: '',
						},
						replace: true,
					})
					return false
				}
			}

			// NOTE - Handle pre-render for bot
			if (from && from.name && from.path !== to.path) {
				const data = await fetch(to.path, {
					headers: new Headers({
						Accept: 'application/json',
					}),
					// credentials: 'omit',
				}).then(async (res) => res.json())

				if (data && data.statusCode !== 200) {
					router.push({
						path: data.redirectUrl,
						replace: false,
					})

					return false
				}

				ServerStore.reInit.LocaleInfo()

				resetSeoTag()
			}

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

				const checkProtection = () => {
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
								replace: navigate.status === 301,
							})
						}

						return false
					}

					return true
				}

				to.meta.reProtect = checkProtection

				if (!checkProtection()) return false
			}

			if (
				successID &&
				!WAITING_VERIFY_ROUTER_NAME_LIST[successID].includes(to.name as string)
			) {
				successID = ''
				successPath = ''
			}

			to.meta.lang = LocaleInfo.langSelected
			to.meta.country = LocaleInfo.countrySelected

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
