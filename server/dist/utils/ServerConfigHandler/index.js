'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
function _nullishCoalesce(lhs, rhsFn) {
	if (lhs != null) {
		return lhs
	} else {
		return rhsFn()
	}
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
var _constants = require('./constants')

const defineServerConfig = (options) => {
	const serverConfigDefined = {}

	for (const key in _constants.defaultServerConfig) {
		if (key === 'locale') {
			if (!options[key])
				serverConfigDefined[key] = _constants.defaultServerConfig[key]
			else {
				serverConfigDefined[key] = {
					enable: options.locale && options.locale.enable ? true : false,
				}

				if (serverConfigDefined[key].enable)
					serverConfigDefined[key] = {
						...serverConfigDefined[key],
						defaultLang: _optionalChain([
							options,
							'access',
							(_) => _[key],
							'optionalAccess',
							(_2) => _2.defaultLang,
						]),
						defaultCountry: _optionalChain([
							options,
							'access',
							(_3) => _3[key],
							'optionalAccess',
							(_4) => _4.defaultCountry,
						]),
						hideDefaultLocale: _nullishCoalesce(
							_optionalChain([
								options,
								'access',
								(_5) => _5[key],
								'optionalAccess',
								(_6) => _6.hideDefaultLocale,
							]),
							() => true
						),
					}
			}
		} // locale
	}

	return serverConfigDefined
}
exports.defineServerConfig = defineServerConfig
