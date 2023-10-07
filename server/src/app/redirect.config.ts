import ValidateLocaleCode from './services/ValidateLocaleCode'

export interface IRedirectResult {
	statusCode: number
	redirectUrl: string
}
export interface IRedirectInfoItem {
	statusCode: number
	path: string
	targetPath: string
}

// NOTE - Declare redirects
export const REDIRECT_INFO: IRedirectInfoItem[] = [
	{
		path: '/test',
		targetPath: '/',
		statusCode: 302,
	},
]

// NOTE - Declare redirect middleware
export const REDIRECT_INJECTION = (redirectUrl, req, res): IRedirectResult => {
	let statusCode = 200

	const pathSplitted = redirectUrl.split('/')

	if (pathSplitted.length === 2 && /(0|1|2)$/.test(redirectUrl)) {
		statusCode = 302
		redirectUrl = redirectUrl.replace(/(0|1|2)$/, '3')
	}

	const localeCodeValidationResult = ValidateLocaleCode(redirectUrl, res)

	if (localeCodeValidationResult.statusCode !== 200) {
		statusCode =
			statusCode === 301 ? statusCode : localeCodeValidationResult.statusCode
		redirectUrl = localeCodeValidationResult.redirectUrl
	}

	return {
		statusCode,
		redirectUrl,
	}
} // REDIRECT_INJECTION
