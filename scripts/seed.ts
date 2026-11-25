/**
 * Fills a local database with fake, anonymous events to work on the dashboards.
 * Usage: bun db:seed
 */
import nextEnv from '@next/env'
import { Client } from 'pg'

import { databaseUrl } from '../src/lib/database-url'

nextEnv.loadEnvConfig(process.cwd(), true)

const url = new URL(databaseUrl())
url.searchParams.delete('schema')
url.searchParams.delete('sslmode')

const client = new Client({ connectionString: url.toString() })
await client.connect()

const versions = ['7.2.0', '7.1.3', '7.1.0', '7.0.2', '6.5.0', '6.4.1']
const games = ['Skyrim SE', 'Skyrim LE', 'Skyrim VR', 'Fallout 4']
const errors = [
  'Cannot read properties of undefined (reading "path")',
  'ENOENT: no such file or directory, open C:\\Users\\Someone\\Documents\\x.psc',
  'Compiler exited with code 1',
]
const pick = <T>(items: readonly T[], skew = 1.6): T => items[Math.floor(Math.random() ** skew * items.length)] as T

const { rows } = await client.query<{ id: number; key: string }>(
  `INSERT INTO apps (name, key) VALUES ('Papyrus Compiler App (seed)', gen_random_uuid()::text) RETURNING id, key`,
)
const app = rows[0]

if (!app) {
  throw new Error('could not create the seed app')
}

const values: unknown[] = []
const tuples: string[] = []

/** Events stored before 2026 hold their properties as a JSON string: `legacy` mimics them. */
function push(type: string, properties: object, date: Date, legacy: boolean) {
  const json = JSON.stringify(properties)
  values.push(type, legacy ? JSON.stringify(json) : json, app?.id, date)
  const i = values.length
  tuples.push(`($${i - 3}, $${i - 2}::jsonb, $${i - 1}, $${i})`)
}

for (let day = 400; day >= 0; day--) {
  const date = new Date(Date.now() - day * 86_400_000)
  const growth = 1 + (400 - day) / 300
  const weekend = [0, 6].includes(date.getUTCDay()) ? 1.4 : 1
  const launches = Math.round((20 + Math.random() * 15) * growth * weekend)
  const legacy = day > 200

  for (let i = 0; i < launches; i++) {
    const at = new Date(date.getTime() - Math.random() * 86_400_000)
    const version = pick(day > 120 ? versions.slice(2) : versions)
    const scripts = 1 + Math.floor(Math.random() ** 2 * 40)

    push(Math.random() < 0.08 ? 'App.FirstLoaded' : 'App.Loaded', { version, publicVersion: version }, at, legacy)
    push('Compilation.Play', { scripts, concurrentScripts: pick([1, 2, 4, 8]) }, at, legacy)

    if (Math.random() < 0.3) push('Compilation.DropScripts', { scripts }, at, legacy)
    if (Math.random() < 0.15) push('Settings.Game', { game: pick(games) }, at, legacy)
    if (Math.random() < 0.1) push('Group.Created', { scripts }, at, legacy)
    if (Math.random() < 0.05) {
      push('Ck.DiagnosticIssues', { game: pick(games), ids: pick(['missing-scripts', 'no-ck']) }, at, legacy)
    }
    if (Math.random() < 0.03) {
      const stack = 'Error\n    at compile (file:///C:/Users/Someone/AppData/Local/pca/app.asar/main.js:1:2301)'
      push('Exception', { error: pick(errors), stack }, at, legacy)
    }
  }

  if (tuples.length > 4000 || day === 0) {
    await client.query(`INSERT INTO events (type, properties, app_id, created_at) VALUES ${tuples.join(',')}`, values)
    tuples.length = 0
    values.length = 0
  }
}

console.log(`seeded app ${app.key}`)
await client.end()
