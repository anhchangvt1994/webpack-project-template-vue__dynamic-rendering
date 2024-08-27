import WorkerPool from 'workerpool'
import { compressContent, optimizeContent, deepOptimizeContent } from './utils'

WorkerPool.worker({
	compressContent,
	optimizeContent,
	deepOptimizeContent,
	finish: () => {
		return 'finish'
	},
})
