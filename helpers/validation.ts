import is from '@sindresorhus/is'
import { ValidationError } from 'class-validator'

function formatErrors(error: ValidationError) {
  if (is.undefined(error.children) || is.nonEmptyArray(error.children)) {
    return error.children.map(e => formatErrors(e))
  }

  return {
    [error.property]: error.constraints,
  }
}

export function createValidation(errors: ValidationError[]) {
  return errors.map(error => formatErrors(error))
}
