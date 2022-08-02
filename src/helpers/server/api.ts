import { NextApiRequest, NextApiResponse } from 'next'
import nc from 'next-connect'

type Req = NextApiRequest & Express.Request
export type Res = NextApiResponse

export function createApi() {
  return nc<Req, Res>({
    onNoMatch(req, res) {
      res.status(405).send({ error: `Method ${req.method} not allowed.` })
    },
  })
}

export function createNotFound<T>(res: Res, payload: T) {
  res.status(404).send({ error: payload })
}

export function createBadRequest<T>(res: Res, payload: T) {
  res.status(400).send({ error: payload })
}

export function createOk<T>(res: Res, data: T, status = 200) {
  if (process.env.NODE_ENV === 'production') {
    // one week in seconds
    res.setHeader('Cache-Control', 'public, max-age=604800')
  }

  res.status(status).send({ data })
}
