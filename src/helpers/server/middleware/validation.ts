import is from '@sindresorhus/is'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { NextApiRequest, NextApiResponse } from 'next'

import { createResponseFromErrors } from '../validation'

type NextHandler = (err?: unknown) => void

// eslint-disable-next-line @typescript-eslint/ban-types
export function validation<T extends object>(cls: ClassConstructor<T>) {
  return async (req: NextApiRequest, res: NextApiResponse, next: NextHandler): Promise<void> => {
    if (!['post', 'put', 'delete', 'patch'].includes(req.method?.toLowerCase() ?? '')) {
      next()
      return
    }

    const obj = plainToInstance(cls, req.body)
    const errors = await validate(obj)

    if (is.nonEmptyArray(errors)) {
      res.status(400).json(createResponseFromErrors(errors))
      return
    }

    req.body = obj

    next()
  }
}
