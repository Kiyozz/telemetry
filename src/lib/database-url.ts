// Production sets the POSTGRES_* variables rather than DATABASE_URL, and .env files
// aren't read in every serverless runtime: the URL is built here instead.
export function databaseUrl(env: Record<string, string | undefined> = process.env): string {
  const {
    POSTGRES_USER: user,
    POSTGRES_PASSWORD: password = '',
    POSTGRES_HOST: host,
    POSTGRES_PORT: port = '5432',
    POSTGRES_DATABASE: database = 'telemetry',
    POSTGRES_SSLMODE: sslmode = 'preferred',
  } = env

  if (env.DATABASE_URL) {
    return env.DATABASE_URL
  }

  if (user && host) {
    const url = new URL(`postgresql://${host}:${port}/${encodeURIComponent(database)}`)
    url.username = encodeURIComponent(user)
    url.password = encodeURIComponent(password)
    url.searchParams.set('sslmode', sslmode)
    return url.toString()
  }

  throw new Error('Set the POSTGRES_* variables or DATABASE_URL to reach the database')
}
