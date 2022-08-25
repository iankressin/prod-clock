const dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration')
const fs = require('fs').promises

const FILE_PATH = '/home/kig/.prodclock.json'

dayjs.extend(duration)

const todayFocus = async () => {
  const file = await readFile()
  const date = currentDate()
  const todayFocusTime = file.dates[date]

  if(!todayFocusTime)
    console.error('ProdClock:: any focus interval started today')

  console.log(`You've been focused for ${parseTime(file.dates[date])} today`)
}

const currentInterval = async () => {
  try {
    console.log(
      'Your current focus period is ',
      parseTime(await calculateCurrentInterval()),
    )
  } catch (error) {
    console.error(error.message)
  }
}

const start = async () => {
  const now = dayjs().valueOf()
  const file = await readFile()

  if (file.started)
    return console.error('ProdClock:: A focus interval has been started')

  file.current = now
  file.started = true

  await writeFile(file)
}

const stop = async () => {
  const file = await readFile()
  const focusTime = await calculateCurrentInterval()
  const parsedTime = parseTime(focusTime)

  console.log('You were able to focus for ', parsedTime)

  file.last = focusTime
  file.started = false

  await writeFile(increaseFocusTime({ file, millis: focusTime }))
}

const increaseFocusTime = ({ file, millis }) => {
  const date = currentDate()

  if (!file.dates)
    file.dates = {}

  if (file.dates[date] !== undefined)
    file.dates[date] = file.dates[date] + millis
  else
    file.dates[date] = millis

  return file
}

const currentDate = () => dayjs().format('YYYY-MM-DD')

const readFile = async () => {
  const file = await fs.readFile(FILE_PATH)

  return JSON.parse(file)
}

const writeFile = async content => {
  await fs.writeFile(FILE_PATH, JSON.stringify(content))
}

const calculateCurrentInterval = async () => {
  const file = await readFile()

  if(!file.started)
    throw Error('ProdClock:: a focus interval was not initiated')

  const current = dayjs(file.current)
  const now = dayjs()

  const focusTime = now.diff(current)

  return focusTime
}

const parseTime = millis => dayjs.duration(millis).format('HH:mm:ss')

const main = async () => {
  const command = process.argv.slice(2)[0]

  if(command === 'start')
    await start()

  else if(command === 'stop')
    await stop()

  else if(command === 'current')
    await currentInterval()

  else if(command === 'today')
    await todayFocus()

  else
    console.error('ProdClock:: Command doesnt exist')
}

main()
