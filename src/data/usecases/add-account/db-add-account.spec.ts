import { DbAddAccount } from './db-add-account'
import { AccountModel, AddAccountModel, AddAccountRepository, Hasher } from './db-add-account-protocols'

const makeHasher = (): Hasher => {
  class HasherStup implements Hasher {
    async hash (value: string): Promise<string> {
      return await new Promise(resolve => resolve('hashed_password'))
    }
  }

  return new HasherStup()
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStup implements AddAccountRepository {
    async add (accountData: AddAccountModel): Promise<AccountModel> {
      return await new Promise(resolve => resolve(makeFakeAccount()))
    }
  }

  return new AddAccountRepositoryStup()
}

const makeFakeAccount = (): AccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email',
  password: 'hashed_password'
})

const makeFakeAccountData = (): AddAccountModel => ({
  name: 'valid_name',
  email: 'valid_email',
  password: 'valid_password'

})

interface SutTypes {
  sut: DbAddAccount
  hasherStup: Hasher
  addAccountRepositoryStup: AddAccountRepository
}

const makeSut = (): SutTypes => {
  const hasherStup = makeHasher()
  const addAccountRepositoryStup = makeAddAccountRepository()
  const sut = new DbAddAccount(hasherStup, addAccountRepositoryStup)
  return { sut, hasherStup, addAccountRepositoryStup }
}

describe('DbAddAccount Usecase', () => {
  test('Should call Hasher with correct password', async () => {
    const { sut, hasherStup } = makeSut()
    const hashSpy = jest.spyOn(hasherStup, 'hash')
    await sut.add(makeFakeAccountData())
    expect(hashSpy).toHaveBeenCalledWith('valid_password')
  })

  test('Should throw if Hasher throws', async () => {
    const { sut, hasherStup } = makeSut()
    jest.spyOn(hasherStup, 'hash').mockRejectedValueOnce(new Error())
    const promise = sut.add(makeFakeAccountData())
    await expect(promise).rejects.toThrow()
  })

  test('Should call AddAccountRepository with correct values', async () => {
    const { sut, addAccountRepositoryStup } = makeSut()
    const addSpy = jest.spyOn(addAccountRepositoryStup, 'add')
    await sut.add(makeFakeAccountData())
    expect(addSpy).toHaveBeenCalledWith({
      name: 'valid_name',
      email: 'valid_email',
      password: 'hashed_password'
    })
  })

  test('Should throw if AddAccountRepository throws', async () => {
    const { sut, addAccountRepositoryStup } = makeSut()
    jest.spyOn(addAccountRepositoryStup, 'add').mockRejectedValueOnce(new Error())
    const promise = sut.add(makeFakeAccountData())
    await expect(promise).rejects.toThrow()
  })

  test('Should return an account on success', async () => {
    const { sut } = makeSut()
    const account = await sut.add(makeFakeAccountData())
    expect(account).toEqual(makeFakeAccount())
  })
})
