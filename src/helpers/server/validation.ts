import is from '@sindresorhus/is'
import { validate, ValidationError } from 'class-validator'

import { createBadRequest, Res } from '@/helpers/server/api'

function formatErrors(error: ValidationError): Record<string, unknown> | Record<string, unknown>[] {
  if (!is.undefined(error.children) && is.nonEmptyArray(error.children)) {
    return error.children.map(e => formatErrors(e)).flat()
  }

  return {
    [error.property]: error.constraints,
  }
}

export function createResponseFromErrors(errors: ValidationError[]) {
  return errors.map(error => formatErrors(error))
}

export async function validateOrBadRequest(res: Res, dto: object) {
  const errors = await validate(dto)

  if (is.nonEmptyArray(errors)) {
    createBadRequest(res, createResponseFromErrors(errors))
    return false
  }

  return true
}
