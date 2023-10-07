import { lookup } from 'geoip-lite'
import {
	COUNTRY_CODE_DEFAULT,
	LANGUAGE_CODE_DEFAULT,
	LOCALE_LIST_WITH_COUNTRY,
	LOCALE_LIST_WITH_LANGUAGE,
} from '../constants'
import { ILocaleInfo } from '../types'
import { getCookieFromRequest } from './CookieHandler'
import ServerConfig from '../server.config'

const LOCALE_INFO_DEFAULT: ILocaleInfo = {
	lang: LANGUAGE_CODE_DEFAULT,
	country: COUNTRY_CODE_DEFAULT,
	clientLang: LANGUAGE_CODE_DEFAULT,
	clientCountry: COUNTRY_CODE_DEFAULT,
	defaultLang: LANGUAGE_CODE_DEFAULT,
	defaultCountry: COUNTRY_CODE_DEFAULT,
	langSelected: LANGUAGE_CODE_DEFAULT,
	countrySelected: COUNTRY_CODE_DEFAULT,
	hideDefaultLocale: Boolean(ServerConfig.locale.hideDefaultLocale),
	range: [1984292864, 1984294911],
	region: 'SC',
	eu: '0',
	timezone: 'America/New_York',
	city: 'Charleston',
	ll: [32.7795, -79.9371],
	metro: 519,
	area: 1000,
}

export default function detectLocale(req): ILocaleInfo {
	if (!req) return LOCALE_INFO_DEFAULT

	const clientIp = (
		req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		''
	)
		.toString()
		.replace(/::ffff:|::1/, '')

	const cookies = getCookieFromRequest(req)

	const localInfo = lookup(clientIp) || LOCALE_INFO_DEFAULT

	const acceptLanguage = req.headers['accept-language']
	let clientLang = LOCALE_INFO_DEFAULT.lang
	let clientCountry = LOCALE_INFO_DEFAULT.country

	if (acceptLanguage) {
		const acceptLanguageCommaSplitted = acceptLanguage
			.replace(/([0-9])\,/g, '$1|')
			.split('|')
		const maxIndex = acceptLanguageCommaSplitted.length - 1
		let favoriteAcceptLanguageIndex = maxIndex

		for (let i = maxIndex; i >= 0; i--) {
			if (!acceptLanguageCommaSplitted[i]) continue
			else if (acceptLanguageCommaSplitted[i].includes('q=')) {
				const acceptLanguageItemQualityValueSplitted =
					acceptLanguageCommaSplitted[i].split(';q=')
				const qualityValue = Number(acceptLanguageItemQualityValueSplitted[1])
				favoriteAcceptLanguageIndex = qualityValue >= 0.5 && i > 0 ? i - 1 : i

				if (favoriteAcceptLanguageIndex === i) break
			}
		}

		;[clientLang, clientCountry] = (() => {
			let favoriteAcceptLanguage =
				acceptLanguageCommaSplitted[favoriteAcceptLanguageIndex]

			if (
				acceptLanguageCommaSplitted[favoriteAcceptLanguageIndex].includes(';q=')
			) {
				const acceptLanguageItemQualityValueSplitted =
					acceptLanguageCommaSplitted[favoriteAcceptLanguageIndex].split(';q=')
				const qualityValue = Number(acceptLanguageItemQualityValueSplitted[1])

				const acceptLanguageSplitted =
					acceptLanguageItemQualityValueSplitted[0].split(',')

				if (qualityValue >= 0.5)
					favoriteAcceptLanguage = acceptLanguageSplitted[0]
				else favoriteAcceptLanguage = acceptLanguageSplitted[1]
			}

			const favoriteAcceptLanguageSplitted = favoriteAcceptLanguage.split('-')

			return [
				favoriteAcceptLanguageSplitted[0],
				favoriteAcceptLanguageSplitted[1] || LOCALE_INFO_DEFAULT.country,
			]
		})()
	}

	const defaultCountry = ServerConfig.locale.defaultCountry?.toUpperCase()
	const defaultLang = ServerConfig.locale.defaultLang
		? ServerConfig.locale.defaultLang
		: !defaultCountry
		? clientCountry
		: undefined

	const pathSplitted = req.originalUrl.split('/')
	const firstDispatcherParam = pathSplitted[1]

	const isLocaleCodeIdFormatValid =
		_checkLocaleCodeIdFormatValid(firstDispatcherParam)

	let langSelected
	let countrySelected

	if (ServerConfig.locale.enable) {
		if (isLocaleCodeIdFormatValid) {
			const arrLocale = firstDispatcherParam.toLowerCase().split('-')

			langSelected = (() => {
				if (!defaultLang) return
				let lang

				if (LOCALE_LIST_WITH_LANGUAGE[arrLocale[0]]) lang = arrLocale[0]
				else if (LOCALE_LIST_WITH_LANGUAGE[arrLocale[1]]) lang = arrLocale[1]
				else lang = defaultLang

				return lang
			})()
			countrySelected = (() => {
				if (!defaultCountry) return
				let country

				if (LOCALE_LIST_WITH_COUNTRY[arrLocale[0]]) country = arrLocale[0]
				else if (LOCALE_LIST_WITH_COUNTRY[arrLocale[1]]) country = arrLocale[1]
				else country = defaultCountry

				return country
			})()
		} else {
			langSelected = (() => {
				if (!defaultLang) return
				let lang = cookies?.['lang']

				if (!LOCALE_LIST_WITH_LANGUAGE[lang]) lang = defaultLang

				return lang
			})()
			countrySelected = (() => {
				if (!defaultCountry) return
				let country = cookies?.['country']

				if (!LOCALE_LIST_WITH_COUNTRY[country]) country = defaultCountry

				return country.toUpperCase()
			})()
		}
	}

	return {
		...localInfo,
		defaultLang,
		defaultCountry,
		langSelected,
		countrySelected,
		clientCountry,
		clientLang,
	} as ILocaleInfo
}

const _checkLocaleCodeIdFormatValid = (firstDispatcherParam) => {
	if (
		!firstDispatcherParam ||
		typeof firstDispatcherParam !== 'string' ||
		!/^[a-z-0-9]{2}(|-[A-Za-z]{2})(?:$)/.test(firstDispatcherParam)
	) {
		return false
	}

	const arrLocale = firstDispatcherParam.toLowerCase().split('-')

	if (arrLocale[0]) {
		if (
			!LOCALE_LIST_WITH_LANGUAGE[arrLocale[0]] &&
			!LOCALE_LIST_WITH_COUNTRY[arrLocale[0]]
		)
			return false
	}

	if (arrLocale[1]) {
		if (
			!LOCALE_LIST_WITH_LANGUAGE[arrLocale[1]] &&
			!LOCALE_LIST_WITH_COUNTRY[arrLocale[1]]
		)
			return false
	}

	return true
} // _checkLocaleCodeIdFormatValid()
