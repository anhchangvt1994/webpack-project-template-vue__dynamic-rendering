import { createApp } from 'vue'
import router from 'app/router'
import 'assets/styles/tailwind.css'
import RouterLink from 'components/RouterLink.vue'

const App = (() => {
	const initVueApp = () => {
		import('App.vue').then(function (data) {
			if (!data || !data.default) return
			createApp(data.default)
				.component('router-link', RouterLink)
				.use(router)
				.mount('#root')
		})
	} // initVueApp()

	return {
		init() {
			initVueApp()
		},
	}
})()
App.init()
