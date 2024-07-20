import ErrorComponent from 'components/ErrorComponent.vue'
import PageLoader from 'components/PageLoader.vue'
import { ServerStore } from 'app/store/ServerStore'
import LazyRoute from 'utils/LazyRoute'
import { type RouteRecordRaw } from 'vue-router'
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
		component: lazyPage(() => import('pages/LoginPage.vue')),
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
	history: createWebHistory(),
	routes,
	sensitive: true,
})

BeforeEach.init(router, {})

export default router
