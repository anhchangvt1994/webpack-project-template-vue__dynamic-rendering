import WorkerPool from 'workerpool'
import Pool from 'workerpool/src/Pool'
import Console from './ConsoleHandler'

interface IInitOptions {
	minWorkers: number
	maxWorkers: number
	workerTerminateTimeout?: number
}

interface IGetFreePool {
	pool: Pool
	terminate: (options?: { force?: boolean; delay?: number }) => void
}

const WorkerManager = (() => {
	return {
		init: (
			workerPath: string,
			options?: IInitOptions,
			instanceTaskList?: string[]
		) => {
			options = {
				minWorkers: 1,
				maxWorkers: 1,
				workerTerminateTimeout: 0,
				...(options || {}),
			}

			let rootCounter = 0

			let curPool = WorkerPool.pool(workerPath, options)

			let terminate: {
				run: IGetFreePool['terminate']
				cancel: () => void
			}

			try {
				if (instanceTaskList && instanceTaskList.length) {
					const promiseTaskList: Promise<any>[] = []
					for (const task of instanceTaskList) {
						promiseTaskList.push(curPool.exec(task, []))
					}

					Promise.all(promiseTaskList)
				}
			} catch (err) {
				Console.error(err)
			}

			const _getTerminate = (
				pool: Pool
			): {
				run: IGetFreePool['terminate']
				cancel: () => void
			} => {
				let timeout: NodeJS.Timeout
				return {
					run: (options) => {
						options = {
							force: false,
							delay: 10000,
							...options,
						}
						rootCounter--

						timeout = setTimeout(async () => {
							curPool = WorkerPool.pool(workerPath, {
								...options,
							})
							terminate = _getTerminate(curPool)

							try {
								if (instanceTaskList && instanceTaskList.length) {
									const promiseTaskList: Promise<any>[] = []
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
								Console.error(err)
							}
						}, options.delay)
					},
					cancel: () => {
						if (timeout) clearTimeout(timeout)
					},
				}
			}

			terminate = _getTerminate(curPool)

			const _getFreePool: (options?: {
				delay?: number
			}) => Promise<IGetFreePool> = (() => {
				return async (options) => {
					options = {
						delay: 0,
						...options,
					}

					rootCounter++

					terminate.cancel()

					if (options.delay) {
						const duration = (options.delay as number) * (rootCounter - 1)

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

export default WorkerManager
