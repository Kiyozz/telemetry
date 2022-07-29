import { NextApiRequest, NextApiResponse } from 'next'

type NextHandler = (err?: unknown) => void

export function contentType(type: string) {
  return (req: NextApiRequest, res: NextApiResponse, next: NextHandler) => {
    if (req.headers['content-type']?.includes(type)) {
      next()
      return
    }

    res.status(415).send({
      error: 'unsupported media type',
      message: `content-type must be ${type}`,
    })
  }
}
