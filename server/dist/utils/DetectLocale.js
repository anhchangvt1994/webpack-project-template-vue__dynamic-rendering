'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj }
}
function _optionalChain(ops) {
	let lastAccessLHS = undefined
	let value = ops[0]
	let i = 1
	while (i < ops.length) {
		const op = ops[i]
		const fn = ops[i + 1]
		i += 2
		if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) {
			return undefined
		}
		if (op === 'access' || op === 'optionalAccess') {
			lastAccessLHS = value
			value = fn(value)
		} else if (op === 'call' || op === 'optionalCall') {
			value = fn((...args) => value.call(lastAccessLHS, ...args))
			lastAccessLHS = undefined
		}
	}
	return value
}
var _geoiplite = require('geoip-lite')

var _constants = require('../constants')

var _CookieHandler = require('./CookieHandler')
var _serverconfig = require('../server.config')
var _serverconfig2 = _interopRequireDefault(_serverconfig)

const LOCALE_INFO_DEFAULT = {
	lang: _constants.LANGUAGE_CODE_DEFAULT,
	country: _constants.COUNTRY_CODE_DEFAULT,
	clientLang: _constants.LANGUAGE_CODE_DEFAULT,
	clientCountry: _constants.COUNTRY_CODE_DEFAULT,
	defaultLang: _constants.LANGUAGE_CODE_DEFAULT,
	defaultCountry: _constants.COUNTRY_CODE_DEFAULT,
	langSelected: _constants.LANGUAGE_CODE_DEFAULT,
	countrySelected: _constants.COUNTRY_CODE_DEFAULT,
	hideDefaultLocale: Boolean(_serverconfig2.default.locale.hideDefaultLocale),
	range: [1984292864, 1984294911],
	region: 'SC',
	eu: '0',
	timezone: 'America/New_York',
	city: 'Charleston',
	ll: [32.7795, -79.9371],
	metro: 519,
	area: 1000,
}

function detectLocale(req) {
	if (!req) return LOCALE_INFO_DEFAULT

	const clientIp = (
		req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		''
	)
		.toString()
		.replace(/::ffff:|::1/, '')

	const cookies = _CookieHandler.getCookieFromRequest.call(void 0, req)

	const localInfo =
		_geoiplite.lookup.call(void 0, clientIp) || LOCALE_INFO_DEFAULT

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

	const defaultCountry = _optionalChain([
		_serverconfig2.default,
		'access',
		(_) => _.locale,
		'access',
		(_2) => _2.defaultCountry,
		'optionalAccess',
		(_3) => _3.toUpperCase,
		'call',
		(_4) => _4(),
	])
	const defaultLang = _serverconfig2.default.locale.defaultLang
		? _serverconfig2.default.locale.defaultLang
		: !defaultCountry
		? clientCountry
		: undefined

	const pathSplitted = req.originalUrl.split('/')
	const firstDispatcherParam = pathSplitted[1]

	const isLocaleCodeIdFormatValid =
		_checkLocaleCodeIdFormatValid(firstDispatcherParam)

	let langSelected
	let countrySelected

	if (_serverconfig2.default.locale.enable) {
		if (isLocaleCodeIdFormatValid) {
			const arrLocale = firstDispatcherParam.toLowerCase().split('-')

			langSelected = (() => {
				if (!defaultLang) return
				let lang

				if (_constants.LOCALE_LIST_WITH_LANGUAGE[arrLocale[0]])
					lang = arrLocale[0]
				else if (_constants.LOCALE_LIST_WITH_LANGUAGE[arrLocale[1]])
					lang = arrLocale[1]
				else lang = defaultLang

				return lang
			})()
			countrySelected = (() => {
				if (!defaultCountry) return
				let country

				if (_constants.LOCALE_LIST_WITH_COUNTRY[arrLocale[0]])
					country = arrLocale[0]
				else if (_constants.LOCALE_LIST_WITH_COUNTRY[arrLocale[1]])
					country = arrLocale[1]
				else country = defaultCountry

				return country
			})()
		} else {
			langSelected = (() => {
				if (!defaultLang) return
				let lang = _optionalChain([
					cookies,
					'optionalAccess',
					(_5) => _5['lang'],
				])

				if (!_constants.LOCALE_LIST_WITH_LANGUAGE[lang]) lang = defaultLang

				return lang
			})()
			countrySelected = (() => {
				if (!defaultCountry) return
				let country = _optionalChain([
					cookies,
					'optionalAccess',
					(_6) => _6['country'],
				])

				if (!_constants.LOCALE_LIST_WITH_COUNTRY[country])
					country = defaultCountry

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
	}
}
exports.default = detectLocale

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
			!_constants.LOCALE_LIST_WITH_LANGUAGE[arrLocale[0]] &&
			!_constants.LOCALE_LIST_WITH_COUNTRY[arrLocale[0]]
		)
			return false
	}

	if (arrLocale[1]) {
		if (
			!_constants.LOCALE_LIST_WITH_LANGUAGE[arrLocale[1]] &&
			!_constants.LOCALE_LIST_WITH_COUNTRY[arrLocale[1]]
		)
			return false
	}

	return true
} // _checkLocaleCodeIdFormatValid()
