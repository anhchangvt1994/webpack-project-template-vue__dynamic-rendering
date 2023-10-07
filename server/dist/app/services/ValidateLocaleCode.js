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

var _constants = require('../../constants')
var _serverconfig = require('../../server.config')
var _serverconfig2 = _interopRequireDefault(_serverconfig)

var _CookieHandler = require('../../utils/CookieHandler')
var _StringHelper = require('../../utils/StringHelper')

const ValidateLocaleCode = (redirectUrl, res) => {
	let statusCode = 200

	if (!_serverconfig2.default.locale.enable)
		return {
			statusCode,
			redirectUrl,
		}

	const LocaleInfo = _optionalChain([
		_CookieHandler.getCookieFromResponse.call(void 0, res),
		'optionalAccess',
		(_) => _['LocaleInfo'],
	])
	const defaultLocale = _StringHelper.getLocale.call(
		void 0,
		LocaleInfo.defaultLang,
		LocaleInfo.defaultCountry
	)

	const pathSplitted = redirectUrl.split('/')
	const firstDispatcherParam = pathSplitted[1]

	if (
		_serverconfig2.default.locale.hideDefaultLocale &&
		firstDispatcherParam === defaultLocale
	) {
		const tmpRedirectUrl = redirectUrl.replace(`/${defaultLocale}`, '')
		return {
			statusCode: 301,
			redirectUrl: tmpRedirectUrl ? tmpRedirectUrl : '/',
		}
	}

	// NOTE - Check valid locale code id format
	/**
	 * ANCHOR - /^[a-z-0-9]{2}(|-[A-Za-z]{2})(?:$)/
	 * ANCHOR - &  LANGUAGE_CODE_LIST.indexOf([A-Za-z]{2}.toLowerCase())
	 * ANCHOR - || COUNTRY_CODE_LIST.indexOf([A-Za-z]{2}.toUpperCase())
	 */
	const isLocaleCodeIdFormatValid =
		_checkLocaleCodeIdFormatValid(firstDispatcherParam)

	// NOTE - If isLocaleCodeIdFormatValid === false
	/**
	 * ANCHOR - firstDispatcherParam is exist and invalid router
	 * => next() and return
	 */

	const localeSelected = _StringHelper.getLocale.call(
		void 0,
		LocaleInfo.langSelected,
		LocaleInfo.countrySelected
	)

	if (isLocaleCodeIdFormatValid && localeSelected !== firstDispatcherParam)
		return {
			statusCode: 301,
			redirectUrl: redirectUrl.replace(firstDispatcherParam, localeSelected),
		}
	else if (
		!isLocaleCodeIdFormatValid &&
		(!_serverconfig2.default.locale.hideDefaultLocale ||
			localeSelected !== defaultLocale)
	)
		return {
			statusCode: 301,
			redirectUrl: `/${localeSelected}${redirectUrl}`,
		}

	return {
		statusCode,
		redirectUrl,
	}
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

exports.default = ValidateLocaleCode
