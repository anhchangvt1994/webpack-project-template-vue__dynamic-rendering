const fs = require('fs-extra')
const { spawn } = require('child_process')

const serverDistPath = './server/dist'

if (fs.existsSync(serverDistPath)) {
	try {
		fs.emptyDirSync(serverDistPath)
		fs.remove(serverDistPath)
	} catch (err) {
		console.error(err)
	}
}

spawn(
	'sucrase',
	['--quiet ./server/src -d ./server/dist --transforms typescript,imports'],
	{
		stdio: 'inherit',
		shell: true,
	}
)
