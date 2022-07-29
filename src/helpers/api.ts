import { createProxyMiddleware } from 'http-proxy-middleware'
import { NextApiRequest, NextApiResponse } from 'next'
import nc from 'next-connect'

import { apiEndpoint } from '../constants'

type Req = NextApiRequest & Express.Request
type Res = NextApiResponse

export default function createApi() {
  return nc<Req, Res>({
    onNoMatch(req, res) {
      res.status(405).json({ error: `Method ${req.method} not allowed.` })
    },
  })
}

export function createNotFound(res: Res, message: string) {
  res.status(404).json({ error: message })
}

export function createProxy(from: string, target: string) {
  return createProxyMiddleware({
    target: apiEndpoint,
    changeOrigin: true,
    pathRewrite: {
      [from]: target,
    },
    timeout: 20_000,
  })
}
