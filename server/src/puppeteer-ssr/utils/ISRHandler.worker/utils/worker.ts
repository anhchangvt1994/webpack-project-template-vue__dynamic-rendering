import WorkerPool from 'workerpool'
import { getInternalHTML, getInternalScript } from './utils'

WorkerPool.worker({
	getInternalScript,
	getInternalHTML,
	finish: () => {
		return 'finish'
	},
})
