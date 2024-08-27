'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj }
}
var _workerpool = require('workerpool')
var _workerpool2 = _interopRequireDefault(_workerpool)

var _ConsoleHandler = require('./ConsoleHandler')
var _ConsoleHandler2 = _interopRequireDefault(_ConsoleHandler)

const WorkerManager = (() => {
	return {
		init: (workerPath, options, instanceTaskList) => {
			options = {
				minWorkers: 1,
				maxWorkers: 1,
				workerTerminateTimeout: 0,
				...(options || {}),
			}

			let rootCounter = 0

			let curPool = _workerpool2.default.pool(workerPath, options)

			let terminate

			try {
				if (instanceTaskList && instanceTaskList.length) {
					const promiseTaskList = []
					for (const task of instanceTaskList) {
						promiseTaskList.push(curPool.exec(task, []))
					}

					Promise.all(promiseTaskList)
				}
			} catch (err) {
				_ConsoleHandler2.default.error(err)
			}

			const _getTerminate = (pool) => {
				let timeout
				return {
					run: (options) => {
						options = {
							force: false,
							delay: 10000,
							...options,
						}
						rootCounter--

						timeout = setTimeout(async () => {
							curPool = _workerpool2.default.pool(workerPath, {
								...options,
							})
							terminate = _getTerminate(curPool)

							try {
								if (instanceTaskList && instanceTaskList.length) {
									const promiseTaskList = []
									for (const task of instanceTaskList) {
										promiseTaskList.push(curPool.exec(task, []))
									}

									await Promise.all(promiseTaskList)
								}

								if (!pool.stats().activeTasks) {
									pool.terminate(options.force)
								} else {
									setTimeout(() => {
										pool.terminate(options.force)
									}, 5000)
								}
							} catch (err) {
								_ConsoleHandler2.default.error(err)
							}
						}, options.delay)
					},
					cancel: () => {
						if (timeout) clearTimeout(timeout)
					},
				}
			}

			terminate = _getTerminate(curPool)

			const _getFreePool = (() => {
				return async (options) => {
					options = {
						delay: 0,
						...options,
					}

					rootCounter++

					terminate.cancel()

					if (options.delay) {
						const duration = options.delay * (rootCounter - 1)

						await new Promise((res) => setTimeout(res, duration))
					}

					return {
						pool: curPool,
						terminate: terminate.run,
					}
				}
			})() // _getFreePool

			return {
				getFreePool: _getFreePool,
			}
		},
	}
})()

exports.default = WorkerManager
