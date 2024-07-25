import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

import ENV_DEFINE_LIST from '../../env/env-register.mjs'
import ObjToEnvConverter from '../utils/ObjectToEnvConverter.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_PATH = __dirname.replace(/\\/g, '/')

// const PREFIX_LIST = [];
const ENV_OBJECT_DEFAULT = {
	PORT: Number(),
	IO_PORT: Number(),
	LOCAL_ADDRESS: String(),
	LOCAL_HOST: String(),
	IPV4_ADDRESS: String(),
	IPV4_HOST: String(),
	IO_HOST: String(),
}
let ENV_VARIABLE_EXPORTER = ''
const ENV_VARIABLE_EXPORTER_FOR_AUTO_IMPORT = {
	'@/config/env/ENV_AUTO_IMPORT.mjs': [],
}
const ENV_OBJ_WITH_JSON_STRINGIFY_VALUE = { ...ENV_OBJECT_DEFAULT }

const generateObjectFormatted = (obj, prefix) => {
	if (!obj || typeof obj !== 'object') return {}
	prefix = prefix ? prefix.toUpperCase() + '_' : ''
	// if (!PREFIX_LIST.includes(prefix)) {
	//   PREFIX_LIST.push(prefix);
	// }

	for (const key in obj) {
		let tmpKey = `${prefix}${key.toUpperCase()}`

		if (typeof obj[key] === 'object' && !obj[key].length) {
			for (const childKey in obj[key]) {
				const envKey = tmpKey + '_' + childKey.toUpperCase()
				ENV_VARIABLE_EXPORTER += `export const ${envKey}=${JSON.stringify(
					obj[key][childKey]
				)};`
				ENV_VARIABLE_EXPORTER_FOR_AUTO_IMPORT[
					'@/config/env/ENV_AUTO_IMPORT.mjs'
				].push(envKey)
				setValueForObject(ENV_OBJECT_DEFAULT, envKey, obj[key][childKey])
				setValueForObject(
					ENV_OBJ_WITH_JSON_STRINGIFY_VALUE,
					envKey,
					JSON.stringify(obj[key][childKey])
				)
			}

			delete obj[key]
		} else {
			ENV_VARIABLE_EXPORTER += `export const ${tmpKey}=${JSON.stringify(
				obj[key]
			)};`
			ENV_VARIABLE_EXPORTER_FOR_AUTO_IMPORT[
				'@/config/env/ENV_AUTO_IMPORT.mjs'
			].push(tmpKey)
			setValueForObject(ENV_OBJECT_DEFAULT, tmpKey, obj[key])
			setValueForObject(
				ENV_OBJ_WITH_JSON_STRINGIFY_VALUE,
				tmpKey,
				JSON.stringify(obj[key])
			)
			delete obj[key]
		}
	}
} // getObjectWithPrefix()

const setValueForObject = (obj, key, value) => {
	if (!typeof obj === 'object' || !key) return
	obj[key] = value
} // setValueForObject()

// NOTE - First step is generate object formatted
if (ENV_DEFINE_LIST.length) {
	ENV_DEFINE_LIST.forEach(function (item) {
		generateObjectFormatted(item.data, item.prefix)
	})
}
// End Region

const promiseENVWriteFileSync = new Promise(function (resolve) {
	try {
		fs.writeFileSync(
			`${PROJECT_PATH}/.env`,
			ObjToEnvConverter(ENV_OBJ_WITH_JSON_STRINGIFY_VALUE)
		)
		fs.writeFileSync(
			`${PROJECT_PATH}/env.json`,
			JSON.stringify(ENV_OBJ_WITH_JSON_STRINGIFY_VALUE)
		)
		fs.writeFileSync(
			`${PROJECT_PATH}/ENV_AUTO_IMPORT.mjs`,
			`${ENV_VARIABLE_EXPORTER}export const ENV_VARIABLE_EXPORTER_FOR_AUTO_IMPORT=${JSON.stringify(
				ENV_VARIABLE_EXPORTER_FOR_AUTO_IMPORT
			)}`
		)

		resolve('done')
	} catch {}
})

export {
	// PREFIX_LIST,
	ENV_OBJECT_DEFAULT,
	ENV_OBJ_WITH_JSON_STRINGIFY_VALUE,
	promiseENVWriteFileSync,
}
