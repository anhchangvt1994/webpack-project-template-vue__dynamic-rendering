import { defineServerConfig } from './utils/ServerConfigHandler'

const ServerConfig = defineServerConfig({
	locale: {
		enable: true,
		defaultLang: 'vi',
		// defaultCountry: 'vn',
	},
})

export default ServerConfig
