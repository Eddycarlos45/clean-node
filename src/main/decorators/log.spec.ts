import { LogErrorRepository } from '../../data/protocols/log-error-repository'
import { AccountModel } from '../../domain/models/account'
import { serverError, ok } from '../../presentation/helpers/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols'
import { LogControllerDecorator } from './log'

const makeLogErrorRepository = (): LogErrorRepository => {
  class LogErrorRepositoryStub implements LogErrorRepository {
    async log (stackError: string): Promise<void> {
      return await new Promise(resolve => resolve())
    }
  }
  return new LogErrorRepositoryStub()
}
const makeController = (): Controller => {
  class ControllerStub implements Controller {
    async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
      return await new Promise(resolve => resolve(ok(makeFakeAccount())))
    }
  }
  return new ControllerStub()
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    email: 'any_email@email.com',
    name: 'any_name',
    password: 'any_password',
    passwordConfirmation: 'any_password'
  }
})

const makeFakeAccount = (): AccountModel => ({
  id: 'valid_id',
  email: 'valid_email@mail.com',
  name: 'valid_name',
  password: 'valid_password'
})

const makeFakeServerError = (): HttpResponse => {
  const fakeError = new Error()
  fakeError.stack = 'any_stack'
  return serverError(fakeError)
}

interface StutTypes {
  sut: LogControllerDecorator
  controllerStub: Controller
  logErrorRepositoryStup: LogErrorRepository
}

const makeSut = (): StutTypes => {
  const controllerStub = makeController()
  const logErrorRepositoryStup = makeLogErrorRepository()
  const sut = new LogControllerDecorator(controllerStub, logErrorRepositoryStup)
  return {
    sut,
    controllerStub,
    logErrorRepositoryStup
  }
}

describe('LogController Decorator', () => {
  test('Should call controller handle ', async () => {
    const { sut, controllerStub } = makeSut()
    const handleSpy = jest.spyOn(controllerStub, 'handle')
    await sut.handle(makeFakeRequest())
    expect(handleSpy).toHaveBeenCalledWith(makeFakeRequest())
  })

  test('Should return the same result of the controller', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok(makeFakeAccount()))
  })

  test('Should call LogErrorRepository with correct error if controller returns a server error', async () => {
    const { sut, controllerStub, logErrorRepositoryStup } = makeSut()
    const logSpy = jest.spyOn(logErrorRepositoryStup, 'log')
    jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(new Promise(resolve => resolve(makeFakeServerError())))
    await sut.handle(makeFakeRequest())
    expect(logSpy).toHaveBeenCalledWith('any_stack')
  })
})
