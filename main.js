const dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration')
const fs = require('fs').promises

const FILE_PATH = '/home/kig/.prodclock.json'

dayjs.extend(duration)

const start = async () => {
  const now = dayjs().valueOf()

  const file = await readFile()

  if (file.started)
    return console.error('ProdClock:: A work interval has been started')


  file.current = now
  file.started = true

  await writeFile(file)
}

const stop = async () => {
  const file = await readFile()

  const current = dayjs(file.current)
  const now = dayjs()

  const focusTime = now.diff(current)
  const parsedTime = dayjs.duration(focusTime).format('HH:mm:ss:SSS')

  console.log('You were able to focus for ', parsedTime)

  file.last = focusTime
  file.started = false

  await writeFile(file)
}

const readFile = async () => {
  const file = await fs.readFile(FILE_PATH)

  return JSON.parse(file)
}

const writeFile = async content => {
  await fs.writeFile(FILE_PATH, JSON.stringify(content))
}

const main = async () => {
  const command = process.argv.slice(2)[0]

  if(command === 'start')
    await start()

  else if(command === 'stop')
    await stop()

  else
    console.error('ProdClock:: Command doesnt exist')
}

main()
