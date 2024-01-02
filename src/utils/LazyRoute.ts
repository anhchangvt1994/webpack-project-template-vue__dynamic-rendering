import type {
	AsyncComponentLoader,
	AsyncComponentOptions,
	Component,
} from 'vue'

export interface ILazyRouteCustomConfig {
	loadingComponent?: Component
	errorComponent?: Component
	delay?: number
	timeout?: number
	suspensible?: boolean
	onError?: (
		error: Error,
		retry: () => void,
		fail: () => void,
		attempts: number
	) => any
}

function LazyRoute() {
	function _generateLazyFunc<T>(
		input: T extends AsyncComponentLoader ? any : any
	) {
		const AsyncComponent = defineAsyncComponent(input)
		return defineComponent({
			render() {
				return h(AsyncComponent, this.$props)
			},
		})
	}

	return {
		init(initConfig?: ILazyRouteCustomConfig) {
			return (input, newConfig?: ILazyRouteCustomConfig) => {
				return _generateLazyFunc<AsyncComponentOptions>({
					...(initConfig || {}),
					...(newConfig || {}),
					loader: input,
				})
			}
		}, // init
	}
}

export default LazyRoute()
