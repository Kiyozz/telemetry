import cache from '../helpers/cache'

async function start() {
  try {
    await cache.reset()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  process.exit(0)
}

start()
