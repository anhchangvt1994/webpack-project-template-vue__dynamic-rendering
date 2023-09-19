import type { Router, RouteLocationNormalized } from 'vue-router'
import type { IUserInfo } from 'store/UserStore'
import { UserInfoState } from 'store/UserStore'
import { resetSeoTag } from 'utils/SeoHelper'

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
		router.beforeEach((to, from) => {
			if (from && from.path !== to.path) {
				fetch(to.path, {
					headers: new Headers({
						Accept:
							'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
					}),
				})
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
