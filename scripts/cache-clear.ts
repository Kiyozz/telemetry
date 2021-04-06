import cache from '../helpers/cache'

async function start() {
  try {
    for (const app of JSON.parse(await cache.getApps()).apps) {
      await cache.deleteAppViaKey(app.key)
    }

    await cache.deleteAllApps()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  process.exit(0)
}

start()
