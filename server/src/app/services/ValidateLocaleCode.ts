import {
	LOCALE_LIST_WITH_COUNTRY,
	LOCALE_LIST_WITH_LANGUAGE,
} from '../../constants'
import ServerConfig from '../../server.config'
import { ILocaleInfo } from '../../types'
import { getCookieFromResponse } from '../../utils/CookieHandler'
import { getLocale } from '../../utils/StringHelper'
import { IRedirectResult } from '../redirect.config'

const ValidateLocaleCode = (redirectUrl: string, res): IRedirectResult => {
	let statusCode = 200

	if (!ServerConfig.locale.enable)
		return {
			statusCode,
			redirectUrl,
		}

	const LocaleInfo = getCookieFromResponse(res)?.['LocaleInfo'] as ILocaleInfo
	const defaultLocale = getLocale(
		LocaleInfo.defaultLang,
		LocaleInfo.defaultCountry
	)

	const pathSplitted = redirectUrl.split('/')
	const firstDispatcherParam = pathSplitted[1]

	if (
		ServerConfig.locale.hideDefaultLocale &&
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

	const localeSelected = getLocale(
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
		(!ServerConfig.locale.hideDefaultLocale || localeSelected !== defaultLocale)
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

export default ValidateLocaleCode
