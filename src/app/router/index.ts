import ErrorComponent from 'components/ErrorComponent.vue'
import PageLoader from 'components/PageLoader.vue'
import { ServerStore } from 'store/ServerStore'
import LazyRoute from 'utils/LazyRoute'
import type { RouteRecordRaw } from 'vue-router'
import BeforeEach from './utils/BeforeEachHandler'

ServerStore.init()

const lazyPage = LazyRoute.init({
	suspensible: false,
	loadingComponent: PageLoader,
	errorComponent: ErrorComponent,
	delay: 100,
	onError(error, retry, fail) {
		fail()
	},
})

const lazyComponent = LazyRoute.init()

const routes: Readonly<RouteRecordRaw[]> = [
	{
		name: import.meta.env.ROUTER_HOME_NAME,
		path: import.meta.env.ROUTER_HOME_PATH,
		component: lazyPage(() => import('pages/HomePage.vue')),
	},
	{
		name: import.meta.env.ROUTER_CONTENT_NAME,
		path: import.meta.env.ROUTER_CONTENT_PATH,
		component: lazyPage(() => import('pages/ContentPage.vue')),
		props: true,

		children: [
			{
				name: import.meta.env.ROUTER_CONTENT_COMMENT_NAME,
				path: 'comment',
				component: lazyComponent(
					() => import('components/comment-page/CommentRow.vue')
				),
			},
			{
				name: import.meta.env.ROUTER_COMMENT_NAME,
				path: import.meta.env.ROUTER_COMMENT_PATH,
				component: lazyComponent(() => import('pages/CommentPage.vue')),
				meta: {
					protect(certInfo) {
						const userInfo = certInfo?.user

						if (!userInfo || !userInfo.email)
							return import.meta.env.ROUTER_LOGIN_PATH

						return true
					},
				},
			},
		],
	},
	{
		name: import.meta.env.ROUTER_LOGIN_NAME,
		path: import.meta.env.ROUTER_LOGIN_PATH,
		component: lazyComponent(() => import('pages/LoginPage.vue')),
		meta: {
			protect(certInfo) {
				if (certInfo && certInfo.user && certInfo.user.email) {
					return (
						certInfo.successPath ||
						(certInfo.navigateInfo?.from?.fullPath ??
							import.meta.env.ROUTER_HOME_PATH)
					)
				}

				return true
			},
		},
	},
	{
		name: import.meta.env.ROUTER_NOT_FOUND_NAME,
		path: import.meta.env.ROUTER_NOT_FOUND_PATH,
		component: lazyPage(() => import('pages/NotFoundPage.vue')),
	},
]

if (LocaleInfo.langSelected || LocaleInfo.countrySelected) {
	routes.map((route) => {
		if (route.name !== import.meta.env.ROUTER_LOGIN_NAME) {
			route.path = `/:locale?${route.path}`
		}

		return route
	})
}

const router = createRouter({
	history: createWebHistory(import.meta.env.ROUTER_BASE_PATH),
	routes,
	sensitive: true,
})

BeforeEach.init(
	router,
	// NOTE - Waiting Verify Router Name List
	/**
	 * It's very useful in case you need to redirect to a previous route after you finish verify
	 * EX:
	 * - You click "See more" comment
	 * - The "See more" comment can only access after you logged
	 * - In case you haven't logged already, the system will redirect you to "login page"
	 * - You click login and the system will redirect you back to "see more" comment page
	 */
	/**
	 * {
	 *  [key: is the back router's name, you need to back after finish verify]: Array<> is list of router's name valid to keep the back router's name (EX: in step you're redirected to login page and you doesn't have account before, you will go to register page to regist and login -> that means register page is valid route to keep the back router's name continuely)
	 * }
	 */
	{
		[import.meta.env.ROUTER_COMMENT_NAME]: [import.meta.env.ROUTER_LOGIN_NAME],
	}
)

export default router
