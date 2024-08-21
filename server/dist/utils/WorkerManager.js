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

			const MAX_WORKERS = options.maxWorkers

			let curPool = _workerpool2.default.pool(workerPath, options)

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

			const _terminate = (pool) => {
				let count = 0
				// let timeout: NodeJS.Timeout
				return () => {
					count++

					if (count === MAX_WORKERS) {
						setTimeout(() => {
							pool.terminate()
						}, 5000)
					}
				}
			}

			const _getFreePool = (() => {
				let count = 0
				let pool = curPool
				let terminate = _terminate(pool)

				return () => {
					count++
					if (count > MAX_WORKERS) {
						count = 1
						pool = curPool
						terminate = _terminate(pool)
					}

					if (count === 1) {
						curPool = _workerpool2.default.pool(workerPath, {
							...options,
						})

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
					}

					return {
						pool,
						terminate,
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
