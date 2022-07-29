import is from '@sindresorhus/is'
import { ValidationError } from 'class-validator'

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
