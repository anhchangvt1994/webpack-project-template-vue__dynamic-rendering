// NOTE - Use for eslint import testing
// declare module '*.vue' {
// 	import type { DefineComponent } from 'vue'
// 	const component: DefineComponent<
// 		Record<string, unknown>,
// 		Record<string, unknown>,
// 		unknown
// 	>
// 	export default component
// }

// router declare
import type { ICertInfo } from 'app/router/utils/BeforeEachHandler'
import 'vue-router'

declare module 'vue-router' {
	interface RouteMeta {
		protect?: (certInfo?: ICertInfo) => boolean | string | void
		reProtect?: () => void
		lang?: string
		country?: string
	}
}

declare global {
	const API_STORE: { [key: string]: any } = {}
}
