import { InvalidParamError } from '../../errors'
import { Validation } from './validation'

export class CompareFieldValidation implements Validation {
  private readonly fieldName
  private readonly fieldToCompareName

  constructor (fieldName: string, fieldToCompareName: string) {
    this.fieldName = fieldName
    this.fieldToCompareName = fieldToCompareName
  }

  validate (input: any): Error | null {
    if (input[this.fieldName] !== input[this.fieldToCompareName]) {
      return new InvalidParamError(this.fieldToCompareName)
    }
    return null
  }
}
