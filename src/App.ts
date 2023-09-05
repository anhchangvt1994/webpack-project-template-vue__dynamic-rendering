import { createApp } from 'vue'
import router from 'config/router'
import 'assets/styles/tailwind.css'

const App = (() => {
	const initVueApp = () => {
		import('App.vue').then(function (data) {
			if (!data || !data.default) return
			createApp(data.default).use(router).mount('#root')
		})
	} // initVueApp()

	return {
		init() {
			initVueApp()
		},
	}
})()
App.init()
