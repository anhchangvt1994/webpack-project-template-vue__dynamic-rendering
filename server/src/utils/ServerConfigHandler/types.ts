export interface IServerConfig {
	locale: {
		enable: boolean
		defaultLang?: string | undefined
		defaultCountry?: string | undefined
		hideDefaultLocale?: boolean
	}
}

export interface IServerConfigOptional {
	locale?: {
		enable: boolean
		defaultLang?: string | undefined
		defaultCountry?: string | undefined
		hideDefaultLocale?: boolean
	}
}
