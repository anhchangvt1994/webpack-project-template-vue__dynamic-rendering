import { defaultServerConfig } from './constants'
import { IServerConfig, IServerConfigOptional } from './types'

export const defineServerConfig = (options: IServerConfigOptional) => {
	const serverConfigDefined = {}

	for (const key in defaultServerConfig) {
		if (key === 'locale') {
			if (!options[key]) serverConfigDefined[key] = defaultServerConfig[key]
			else {
				serverConfigDefined[key] = {
					enable: options.locale && options.locale.enable ? true : false,
				}

				if (serverConfigDefined[key].enable)
					serverConfigDefined[key] = {
						...serverConfigDefined[key],
						defaultLang: options[key]?.defaultLang,
						defaultCountry: options[key]?.defaultCountry,
						hideDefaultLocale: options[key]?.hideDefaultLocale ?? true,
					}
			}
		} // locale
	}

	return serverConfigDefined as IServerConfig
}
