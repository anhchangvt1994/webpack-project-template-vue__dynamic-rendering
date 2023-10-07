import {
	IRedirectInfoItem,
	IRedirectResult,
	REDIRECT_INFO,
	REDIRECT_INJECTION,
} from '../app/redirect.config'

const DetectRedirect: (req, res) => IRedirectResult = (req, res) => {
	let statusCode = 200
	let redirectUrl = ''

	const headers = req.headers

	if (
		['puppeteer', 'web-scraping-service', 'cleaner-service'].includes(
			headers['service']
		)
	)
		return {
			statusCode,
			redirectUrl,
		}

	const REDIRECT_INFO_FORMATTED = (() => {
		if (!REDIRECT_INFO || !REDIRECT_INFO.length) return []

		const tmpRedirectInfoFormatted: (IRedirectInfoItem & {
			pathRegex: RegExp
		})[] = []

		for (const redirectInfoItem of REDIRECT_INFO) {
			tmpRedirectInfoFormatted.push({
				...redirectInfoItem,
				pathRegex: new RegExp(`${redirectInfoItem.path}(/|$)`),
			})
		}

		return tmpRedirectInfoFormatted
	})()

	const urlInfo = new URL(`${process.env.BASE_URL}${req.originalUrl}`)
	const originalUrl = urlInfo.href.replace(urlInfo.origin, '')

	for (const redirectInfoItem of REDIRECT_INFO_FORMATTED) {
		if (redirectInfoItem.pathRegex.test(urlInfo.pathname)) {
			statusCode = redirectInfoItem.statusCode
			redirectUrl = originalUrl.replace(
				redirectInfoItem.path,
				redirectInfoItem.targetPath
			)
			break
		}
	}

	redirectUrl = (() => {
		const query = urlInfo.searchParams

		if (query.get('urlTesting')) return originalUrl

		return /\/$/.test(urlInfo.pathname)
			? urlInfo.pathname.slice(0, -1)
			: urlInfo.pathname
	})()

	if (redirectUrl && redirectUrl !== originalUrl) statusCode = 301

	const redirectInjectionResult = REDIRECT_INJECTION(
		redirectUrl || originalUrl,
		req,
		res
	)

	if (redirectInjectionResult.statusCode !== 200) {
		statusCode =
			statusCode === 301 ? statusCode : redirectInjectionResult.statusCode
		redirectUrl = redirectInjectionResult.redirectUrl
	}

	return {
		statusCode,
		redirectUrl,
	}
}

export default DetectRedirect
