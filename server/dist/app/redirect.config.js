'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj }
}
var _ValidateLocaleCode = require('./services/ValidateLocaleCode')
var _ValidateLocaleCode2 = _interopRequireDefault(_ValidateLocaleCode)

// NOTE - Declare redirects
const REDIRECT_INFO = [
	{
		path: '/test',
		targetPath: '/',
		statusCode: 302,
	},
]
exports.REDIRECT_INFO = REDIRECT_INFO

// NOTE - Declare redirect middleware
const REDIRECT_INJECTION = (redirectUrl, req, res) => {
	let statusCode = 200

	const pathSplitted = redirectUrl.split('/')

	if (pathSplitted.length === 2 && /(0|1|2)$/.test(redirectUrl)) {
		statusCode = 302
		redirectUrl = redirectUrl.replace(/(0|1|2)$/, '3')
	}

	const localeCodeValidationResult = _ValidateLocaleCode2.default.call(
		void 0,
		redirectUrl,
		res
	)

	if (localeCodeValidationResult.statusCode !== 200) {
		statusCode =
			statusCode === 301 ? statusCode : localeCodeValidationResult.statusCode
		redirectUrl = localeCodeValidationResult.redirectUrl
	}

	return {
		statusCode,
		redirectUrl,
	}
}
exports.REDIRECT_INJECTION = REDIRECT_INJECTION // REDIRECT_INJECTION
