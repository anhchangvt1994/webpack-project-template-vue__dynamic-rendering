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
	terminate: () => void
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

			const MAX_WORKERS = options.maxWorkers

			let curPool = WorkerPool.pool(workerPath, options)

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

			const _terminate = (pool: Pool) => {
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

			const _getFreePool: () => IGetFreePool = (() => {
				let count = 0
				let pool = curPool as Pool
				let terminate = _terminate(pool)

				return () => {
					count++
					if (count > MAX_WORKERS) {
						count = 1
						pool = curPool
						terminate = _terminate(pool)
					}

					if (count === 1) {
						curPool = WorkerPool.pool(workerPath, {
							...options,
						})

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

export default WorkerManager
