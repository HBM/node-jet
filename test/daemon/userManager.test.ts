import { NotAuthorized } from '../../src'
import { UserManager } from '../../src/3_jet/daemon/UserManager'

describe('Testing UserManager', () => {
  it('Should create User Manager', () => {
    const manager = new UserManager('foo', 'foo2')
    expect(() => manager.addUser('f', 'foo3', 'test', ['beta'])).toThrow(
      new NotAuthorized('Only admin users can create User')
    )
    manager.addUser('foo', 'foo3', 'test', ['beta'])
    expect(() => manager.addUser('foo', 'foo3', 'test', ['beta'])).toThrow()

    expect(manager.login('foo', 'foo')).toBeFalsy()
    expect(manager.login('foo', 'foo2')).toBeTruthy()
    expect(manager.isAllowed('get', 'foo', undefined)).toBeTruthy()
    expect(() =>
      manager.isAllowed('get', 'foo3', { read: 'alpha', write: '' })
    ).toThrow()
    expect(
      manager.isAllowed('get', 'foo3', { read: 'admin', write: '' })
    ).toBeFalsy()
    expect(
      manager.isAllowed('get', 'foo', { read: 'admin', write: '' })
    ).toBeTruthy()
    expect(
      manager.isAllowed('set', 'foo', { read: 'admin', write: '' })
    ).toBeTruthy()
  })
})
