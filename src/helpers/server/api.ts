import { NextApiRequest, NextApiResponse } from 'next'
import nc from 'next-connect'

type Req = NextApiRequest & Express.Request
type Res = NextApiResponse

export function createApi() {
  return nc<Req, Res>({
    onNoMatch(req, res) {
      res.status(405).json({ error: `Method ${req.method} not allowed.` })
    },
  })
}

export function createNotFound(res: Res, message: string) {
  res.status(404).json({ error: message })
}
